"""Collect new guestbook comments from ntfy.sh and store them in assets/data/guestbook.json."""

import json
import os
import re
import sys
import time
import urllib.request

CONFIG = "assets/js/config.js"
DATA = "assets/data/guestbook.json"
KEEP = 500
PER_RUN = 50
SEEN_TTL = 13 * 3600

LINK = re.compile(
    r"(https?://|www\.|t\.me/|\b[\w-]+\.(?:com|net|org|ru|uz|io|me|xyz|top|info|site|online|shop|click|link|biz|club|pro)\b)",
    re.I,
)
CONTROL = re.compile(r"[\u0000-\u0008\u000b-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]")


ORIG_ID = re.compile(r"^[A-Za-z0-9]{6,24}$")


def origin(message):
    """A keep-alive copy carries the original id and time in its tags (o-<id>, t-<unix>)."""
    tags = message.get("tags") or []
    oid = next((t[2:] for t in tags if str(t).startswith("o-")), "")
    ot = next((t[2:] for t in tags if str(t).startswith("t-")), "")
    if ORIG_ID.match(oid) and ot.isdigit() and message["time"] - 30 * 86400 <= int(ot) <= message["time"]:
        return oid, int(ot)
    return str(message["id"]), int(message["time"])


def clean(message):
    if message.get("event") != "message" or message.get("attachment"):
        return None
    nick = re.sub(r"\s+", " ", CONTROL.sub("", str(message.get("title") or ""))).strip()
    text = CONTROL.sub("", str(message.get("message") or "")).replace("\r", "")
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if not 2 <= len(nick) <= 32 or not 2 <= len(text) <= 500:
        return None
    if LINK.search(nick) or LINK.search(text):
        return None
    oid, otime = origin(message)
    return {"id": oid, "time": otime, "nick": nick, "text": text}


def output(changed):
    target = os.environ.get("GITHUB_OUTPUT")
    if target:
        with open(target, "a", encoding="utf-8") as fh:
            fh.write(f"changed={'true' if changed else 'false'}\n")


def main():
    match = re.search(r'topic:\s*"([A-Za-z0-9_-]{1,64})"', open(CONFIG, encoding="utf-8").read())
    if not match:
        print("guestbook: no topic in config.js")
        return output(False)
    topic = match.group(1)
    server = re.search(r'server:\s*"(https?://[^"\s]+)"', open(CONFIG, encoding="utf-8").read())
    server = server.group(1).rstrip("/") if server else "https://ntfy.sh"

    try:
        data = json.load(open(DATA, encoding="utf-8"))
    except FileNotFoundError:
        data = {"comments": [], "seen": {}}
    comments = data.get("comments", [])
    seen = data.get("seen", {})

    req = urllib.request.Request(
        f"{server}/{topic}/json?poll=1&since=all", headers={"User-Agent": "guestbook-sync"}
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        lines = res.read().decode("utf-8").splitlines()
    messages = [json.loads(line) for line in lines if line.strip()]
    messages = [m for m in messages if m.get("id") and m.get("time")]
    messages.sort(key=lambda m: (m["time"], m["id"]))

    known = {c["id"] for c in comments}
    pairs = {(c["nick"].lower(), c["text"].lower()) for c in comments}
    fresh, added = 0, 0
    now = int(time.time())
    for message in messages:
        mid = str(message["id"])
        if mid in seen or mid in known:
            continue
        fresh += 1
        # `seen` keeps the processing time, so an id is remembered for 13 h after we handled it,
        # longer than ntfy keeps any message or copy of it
        seen[mid] = now
        comment = clean(message)
        if not comment or added >= PER_RUN:
            continue
        if comment["id"] != mid:
            if comment["id"] in seen or comment["id"] in known:
                continue
            seen[comment["id"]] = now
        pair = (comment["nick"].lower(), comment["text"].lower())
        if pair in pairs:
            continue
        pairs.add(pair)
        known.add(comment["id"])
        comments.append(comment)
        added += 1

    if not fresh:
        print("guestbook: nothing new")
        return output(False)

    cutoff = time.time() - SEEN_TTL
    data = {
        "comments": sorted(comments, key=lambda c: (c["time"], c["id"]))[-KEEP:],
        "seen": {k: v for k, v in sorted(seen.items(), key=lambda kv: kv[1]) if v >= cutoff},
    }
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    with open(DATA, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print(f"guestbook: {fresh} new message(s), {added} comment(s) saved")
    output(True)


if __name__ == "__main__":
    sys.exit(main())
