// Public feeds for the site, cached in public.feed_cache, so visitors never call
// SANS ISC / NVD / FIRST directly: no per-visitor rate limits, no blocks, no CORS surprises.
//   GET /functions/v1/feeds?src=isc    → { level, date, ports[], ips[] }
//   GET /functions/v1/feeds?src=vulns  → { cves[], top[], total, hot }
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const API = Deno.env.get("SUPABASE_URL") ?? "";
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const UA = "khayrullayev03-portfolio/1.0 (+https://khayrullayev03.github.io/dashboard/)";
const TTL: Record<string, number> = { isc: 30 * 60, vulns: 60 * 60 };
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type Json = Record<string, unknown>;

async function getJSON(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    redirect: "manual",
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function isc(): Promise<Json> {
  const base = "https://isc.sans.edu/api/";
  const [infocon, ports, ips] = await Promise.all([
    getJSON(base + "infocon?json"),
    getJSON(base + "topports/records/8?json"),
    getJSON(base + "sources/attacks/6?json").catch(() => []),
  ]);
  const portList = Object.keys(ports)
    .filter((k) => /^\d+$/.test(k))
    .map((k) => ({ targetport: ports[k].targetport, records: ports[k].records }));
  return {
    level: String(infocon.status || "green").toLowerCase(),
    date: ports.date ?? null,
    ports: portList,
    ips: Array.isArray(ips) ? ips.slice(0, 6).map((r: any) => ({ ip: r.ip, attacks: r.attacks })) : [],
  };
}

async function vulns(): Promise<Json> {
  const day = 86400000;
  const iso = (d: Date) => d.toISOString().slice(0, 23);
  const end = new Date();
  const start = new Date(end.getTime() - 2 * day);
  const base = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${iso(start)}&pubEndDate=${iso(end)}`;
  const [head, epss] = await Promise.all([
    getJSON(`${base}&resultsPerPage=1`),
    getJSON("https://api.first.org/data/v1/epss?epss-gt=0.9&limit=200"),
  ]);
  const total = head.totalResults || 0;
  const list = await getJSON(`${base}&resultsPerPage=8&startIndex=${Math.max(0, total - 8)}`);
  const cves = (list.vulnerabilities || [])
    .map((v: any) => v.cve)
    .reverse()
    .map((c: any) => {
      const m = c.metrics || {};
      const key = ["cvssMetricV40", "cvssMetricV31", "cvssMetricV30", "cvssMetricV2"].find((k) => m[k] && m[k].length);
      const data = key ? m[key][0].cvssData || {} : {};
      const desc = (c.descriptions || []).find((d: any) => d.lang === "en") || (c.descriptions || [])[0] || {};
      return {
        id: c.id,
        score: data.baseScore,
        severity: String(data.baseSeverity || (key ? m[key][0].baseSeverity : "") || "").toUpperCase(),
        published: c.published,
        text: String(desc.value || "").slice(0, 400),
      };
    });
  const order = (id: string) => {
    const [, year, n] = String(id).split("-");
    return Number(year) * 1e7 + Number(n);
  };
  const top = (epss.data || [])
    .sort((a: any, b: any) => order(b.cve) - order(a.cve))
    .slice(0, 8)
    .map((r: any) => ({ cve: r.cve, epss: r.epss, percentile: r.percentile, date: r.date }));
  return { cves, top, total, hot: epss.total || top.length };
}

const BUILD: Record<string, () => Promise<Json>> = { isc, vulns };

async function readCache(key: string): Promise<{ data: Json; fetched_at: string } | null> {
  if (!API || !KEY) return null;
  const res = await fetch(`${API}/rest/v1/feed_cache?key=eq.${key}&select=data,fetched_at`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ?? null;
}

async function writeCache(key: string, data: Json, fetchedAt: string) {
  if (!API || !KEY) return;
  await fetch(`${API}/rest/v1/feed_cache`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ key, data, fetched_at: fetchedAt }),
  });
}

function reply(body: Json, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${Math.max(0, Math.floor(Math.min(maxAge, 300)))}`,
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "GET") return reply({ error: "method" }, 405);
  const src = new URL(req.url).searchParams.get("src") ?? "";
  const build = BUILD[src];
  if (!build) return reply({ error: "unknown src" }, 400);

  const hit = await readCache(src).catch(() => null);
  const age = hit ? (Date.now() - Date.parse(hit.fetched_at)) / 1000 : Infinity;
  if (hit && age < TTL[src])
    return reply({ ...hit.data, fetched_at: hit.fetched_at, cached: true }, 200, TTL[src] - age);

  try {
    const data = await build();
    const fetchedAt = new Date().toISOString();
    await writeCache(src, data, fetchedAt).catch(() => {});
    return reply({ ...data, fetched_at: fetchedAt }, 200, TTL[src]);
  } catch (_e) {
    if (hit) return reply({ ...hit.data, fetched_at: hit.fetched_at, stale: true }, 200, 300);
    return reply({ error: "upstream unavailable" }, 502);
  }
});
