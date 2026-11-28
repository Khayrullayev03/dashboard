(function(){"use strict";const z=`
attribute vec3 aPos;
attribute vec3 aNor;
attribute vec2 aUv;
attribute float aA;
uniform mat4 uProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormal;
varying vec3 vNor;
varying vec3 vPos;
varying vec2 vUv;
varying float vA;
void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vPos = wp.xyz;
  vNor = uNormal * aNor;
  vUv = aUv;
  vA = aA;
  gl_Position = uProj * uView * wp;
}`,C=`
precision mediump float;
uniform sampler2D uTex;
uniform vec3 uEye;
uniform vec3 uLight;
varying vec3 vNor;
varying vec3 vPos;
varying vec2 vUv;
varying float vA;
void main() {
  if (vA < 0.16) discard;
  vec3 N = normalize(vNor);
  vec3 V = normalize(uEye - vPos);
  if (dot(N, V) < 0.0) N = -N;
  vec3 L = normalize(uLight);
  vec3 H = normalize(L + V);
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 42.0);
  vec3 R = reflect(-V, N);
  float sky = smoothstep(-0.35, 0.85, R.y);
  vec3 env = mix(vec3(0.16, 0.03, 0.05), vec3(1.0, 0.97, 0.98), sky);
  float lum = texture2D(uTex, vUv).r;
  vec3 base = mix(vec3(0.42), vec3(1.0), lum);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.4);
  vec3 col = base * env * (0.32 + 0.78 * diff) + spec * 1.15 + rim * vec3(0.95, 0.18, 0.26);
  gl_FragColor = vec4(col, 1.0);
}`;function B(s,e,o){const t=s.createShader(e);return s.shaderSource(t,o),s.compileShader(t),s.getShaderParameter(t,s.COMPILE_STATUS)?t:null}function G(s,e,o,t){const u=1/Math.tan(s/2),E=1/(o-t);return new Float32Array([u/e,0,0,0,0,u,0,0,0,0,(t+o)*E,-1,0,0,2*t*o*E,0])}function V(s,e){const o=Math.cos(s),t=Math.sin(s),u=Math.cos(e),E=Math.sin(e);return[o,t*E,-t*u,0,u,E,t,-o*E,o*u]}function X(s,e,o,t){const u=document.createElement("canvas");u.width=e,u.height=o;const E=u.getContext("2d");E.drawImage(s,0,0,e,o);const I=E.getImageData(0,0,e,o).data;let f=new Float32Array(e*o);for(let r=0;r<f.length;r++)f[r]=I[r*4+3]/255;const p=new Float32Array(f.length);for(let r=0;r<o;r++)for(let i=0;i<e;i++){let a=0,m=0;for(let F=-1;F<=1;F++)for(let _=-1;_<=1;_++){const M=i+_,R=r+F;M<0||R<0||M>=e||R>=o||(a+=f[R*e+M],m++)}p[r*e+i]=a/m}f=p;const v=s.width/s.height,x=2*v/(e-1),h=2/(o-1),y=r=>{const i=Math.min(1,Math.max(0,(f[r]-.08)/.7));return i*i*(3-2*i)*t},l=e*o,N=new Float32Array(l*2*3),P=new Float32Array(l*2*3),g=new Float32Array(l*2*2),D=new Float32Array(l*2);for(let r=0;r<o;r++)for(let i=0;i<e;i++){const a=r*e+i,m=y(a),F=y(r*e+Math.max(0,i-1)),_=y(r*e+Math.min(e-1,i+1)),M=y(Math.max(0,r-1)*e+i),R=y(Math.min(o-1,r+1)*e+i),n=(_-F)/(2*x),c=-(R-M)/(2*h),d=Math.hypot(n,c,1),A=-v+i*x,U=1-r*h;for(const L of[0,1]){const S=a+L*l,w=L?-1:1;N.set([A,U,m*w],S*3),P.set([-n*w/d,-c*w/d,w/d],S*3),g.set([i/(e-1),r/(o-1)],S*2),D[S]=f[a]}}const b=[];for(let r=0;r<o-1;r++)for(let i=0;i<e-1;i++){const a=r*e+i;Math.max(f[a],f[a+1],f[a+e],f[a+e+1])<.16||(b.push(a,a+1,a+e+1,a,a+e+1,a+e),b.push(a+l,a+e+1+l,a+1+l,a+l,a+e+l,a+e+1+l))}return{pos:N,nor:P,uv:g,al:D,idx:new Uint32Array(b),aspect:v}}function W(s,e={}){const o={src:"assets/img/logo-mark.webp",lite:!1,speed:.55,depth:.1,tilt:-.14,swing:0,entry:!1,...e};let t=null;try{t=s.getContext("webgl",{alpha:!0,antialias:!o.lite,premultipliedAlpha:!0,failIfMajorPerformanceCaveat:!0})}catch{t=null}if(!t||!t.getExtension("OES_element_index_uint"))return null;const u=t.getExtension("WEBGL_debug_renderer_info"),E=String(t.getParameter(u?u.UNMASKED_RENDERER_WEBGL:t.RENDERER));if(/swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i.test(E)){const n=t.getExtension("WEBGL_lose_context");return n&&n.loseContext(),null}const I=B(t,t.VERTEX_SHADER,z),f=B(t,t.FRAGMENT_SHADER,C);if(!I||!f)return null;const p=t.createProgram();if(t.attachShader(p,I),t.attachShader(p,f),t.linkProgram(p),!t.getProgramParameter(p,t.LINK_STATUS))return null;t.useProgram(p);const v=n=>t.getUniformLocation(p,n),x={proj:v("uProj"),view:v("uView"),model:v("uModel"),normal:v("uNormal"),eye:v("uEye"),light:v("uLight"),tex:v("uTex")};let h=null,y=!1,l=0,N=!1,P=!1,g=performance.now(),D=0,b=0,r=0;const i=[];function a(n,c,d){const A=t.getAttribLocation(p,n),U=t.createBuffer();i.push(U),t.bindBuffer(t.ARRAY_BUFFER,U),t.bufferData(t.ARRAY_BUFFER,c,t.STATIC_DRAW),t.enableVertexAttribArray(A),t.vertexAttribPointer(A,d,t.FLOAT,!1,0,0)}const m=new Image;m.decoding="async",m.onload=()=>{if(P)return;const n=o.lite?150:240;h=X(m,n,Math.round(n/(m.width/m.height)),o.depth),a("aPos",h.pos,3),a("aNor",h.nor,3),a("aUv",h.uv,2),a("aA",h.al,1);const c=t.createBuffer();i.push(c),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,c),t.bufferData(t.ELEMENT_ARRAY_BUFFER,h.idx,t.STATIC_DRAW);const d=t.createTexture();t.bindTexture(t.TEXTURE_2D,d),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,m),t.uniform1i(x.tex,0),t.enable(t.DEPTH_TEST),y=!0,_(performance.now())},m.src=o.src;function F(){const n=o.lite?1:Math.min(2,window.devicePixelRatio||1),c=Math.max(1,Math.round(s.clientWidth*n)),d=Math.max(1,Math.round(s.clientHeight*n));(s.width!==c||s.height!==d)&&(s.width=c,s.height=d)}function _(n){if(!y||P)return;F();const c=s.width,d=s.height;t.viewport(0,0,c,d),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT);const A=(n-g)/1e3,U=c/d,L=.52,w=Math.max(1,h.aspect/U)*1.08/Math.tan(L/2)+o.depth,O=o.swing?Math.sin(A*o.speed)*o.swing:o.speed?A*o.speed:.45,H=o.entry?Math.pow(1-Math.min(1,A/1.6),3)*Math.PI*2:0,j=O+H+r+D,Y=o.tilt+Math.sin(A*.8)*.04+b,T=V(j,Y);t.uniformMatrix4fv(x.proj,!1,G(L,U,.1,40)),t.uniformMatrix4fv(x.view,!1,new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,-w,1])),t.uniformMatrix4fv(x.model,!1,new Float32Array([T[0],T[1],T[2],0,T[3],T[4],T[5],0,T[6],T[7],T[8],0,0,0,0,1])),t.uniformMatrix3fv(x.normal,!1,new Float32Array(T)),t.uniform3f(x.eye,0,0,w),t.uniform3f(x.light,Math.cos(A*.5)*.7,.75,.9),t.drawElements(t.TRIANGLES,h.idx.length,t.UNSIGNED_INT,0)}function M(n){l=requestAnimationFrame(M),_(n)}s.addEventListener("webglcontextlost",n=>{n.preventDefault(),R.stop()});const R={start(){N||P||(N=!0,l=requestAnimationFrame(M))},stop(){N=!1,cancelAnimationFrame(l),l=0},pointer(n,c){D=n*.6,b=c*.25,N||_(performance.now())},spinTo(n){r=n},dispose(){R.stop(),P=!0,i.forEach(c=>t.deleteBuffer(c));const n=t.getExtension("WEBGL_lose_context");n&&n.loseContext()}};return R}window.MARK3D={create:W}})();
