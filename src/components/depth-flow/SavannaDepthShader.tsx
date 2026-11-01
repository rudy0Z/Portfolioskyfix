"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export interface SavannaDepthShaderProps {
  sceneUrl?: string;
  mapsUrl?: string;
  focus?: [number, number];
  style?: CSSProperties;
  className?: string;
}

const VERT = `#version 300 es
in vec2 p;
void main() {
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D img;
uniform sampler2D maps;
uniform vec2 r;
uniform float t;
uniform vec2 m;
uniform vec2 o;
uniform float ia;
out vec4 fragColor;

vec2 cover(vec2 uv, float zoom) {
  float sa = r.x / r.y;
  vec2 s = sa > ia ? vec2(1.0, ia / sa) : vec2(sa / ia, 1.0);
  s /= zoom;
  vec2 c = clamp(o, s * 0.5, 1.0 - s * 0.5);
  return c + (uv - 0.5) * s;
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float dn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

vec2 curl(vec2 p) {
  float e = 0.05;
  float n1 = dn(p + vec2(0.0, e)), n2 = dn(p - vec2(0.0, e));
  float n3 = dn(p + vec2(e, 0.0)), n4 = dn(p - vec2(e, 0.0));
  return vec2(n1 - n2, -(n3 - n4)) / (2.0 * e);
}

vec2 drift(vec2 iu, float amp, float speed) {
  float T = t * speed;
  vec2 q = iu * 1.6;
  vec2 f = curl(q + vec2(T, T * 0.6)) * 0.6 + curl(q * 2.1 - vec2(T * 0.8, -T * 1.1)) * 0.4;
  return iu + f * amp * 0.18;
}

float depthAt(vec2 iu) {
  return textureLod(maps, iu, 1.0).r;
}

vec2 parallax(vec2 iu, vec2 cam, float focal) {
  vec2 i = iu;
  for(int k = 0; k < 5; k++) {
    i = iu - cam * (depthAt(i) - focal);
  }
  return i;
}

vec2 camMove(float amp, float speed) {
  vec2 auto_ = vec2(sin(t * speed), sin(t * speed * 0.71 + 1.3) * 0.6) * amp;
  return auto_ + (m - 0.5) * vec2(2.0, 1.4) * amp;
}

const vec2 SUN = vec2(0.5, 0.55);
float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

float bird(vec2 q, float s, float ph) {
  q /= s;
  q.x = abs(q.x);
  float flap = sin(ph) * 0.55;
  float y = q.x * (0.35 + flap) - q.x * q.x * (0.6 + flap * 0.8);
  float wing = smoothstep(0.09, 0.0, abs(q.y - y)) * step(q.x, 1.0);
  float body = smoothstep(0.16, 0.0, length(q * vec2(1.0, 1.6)));
  return max(wing, body);
}

void main() {
  vec2 uv = gl_FragCoord.xy / r;
  vec2 iu = cover(uv, 1.06);
  vec2 cam = camMove(0.01, 0.08);
  vec2 ip = parallax(iu, cam, 0.35);
  vec3 base = textureLod(img, ip, 0.0).rgb;

  float L = lum(base);
  float sil = smoothstep(0.13, 0.05, L);
  float sky = smoothstep(0.36, 0.46, ip.y) * (1.0 - sil);
  float t1 = t;

  // Acacia tree canopy sway
  float canopy = sil * smoothstep(0.5, 0.85, ip.y);
  float wind = sin(t1 * 0.9 + ip.x * 6.0) * 0.6 + sin(t1 * 1.7 + ip.x * 13.0 + ip.y * 9.0) * 0.4;
  vec2 tw = vec2(wind * 0.0028, wind * 0.0008) * canopy * smoothstep(0.45, 0.95, ip.y);

  // Sun disc breathing & cloud drift
  float sunD = length((ip - SUN) * vec2(ia, 1.0));
  float cl = sky * smoothstep(0.14, 0.24, sunD);
  vec2 dr = drift(ip, 0.035, 0.035) - ip;
  dr.x += 0.004 * sin(t1 * 0.05);

  // River water shimmer
  float river = smoothstep(0.2, 0.24, ip.y) * smoothstep(0.31, 0.27, ip.y);
  vec2 rv = vec2(sin(ip.y * 420.0 + t1 * 2.2) * 0.0016, 0.0) * river * smoothstep(0.2, 0.32, L);

  // Bottom prairie grass sway
  float grass = smoothstep(0.16, 0.02, ip.y);
  vec2 gw = vec2(sin(t1 * 1.4 + ip.x * 40.0) * 0.0018, 0.0) * grass * sil;

  vec2 q = ip + tw + dr * cl + rv + gw;
  vec3 col = texture(img, clamp(q, 0.001, 0.999)).rgb;

  // Flapping silhouette birds across the sunset sun
  for(int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 bp = vec2(0.35 + fi * 0.08 + t1 * 0.03, 0.52 + sin(fi * 1.5 + t1 * 0.4) * 0.04);
    vec2 bq = (q - bp) * vec2(ia, 1.0);
    float b = bird(bq, 0.014 + fi * 0.002, t1 * 12.0 + fi * 2.0);
    col = mix(col, vec3(0.04, 0.02, 0.02), b * 0.9);
  }

  fragColor = vec4(col, 1.0);
}
`;

export function SavannaDepthShader({
  sceneUrl = "https://dvklab.vercel.app/templates/savanna/scene.jpg",
  mapsUrl = "https://dvklab.vercel.app/templates/savanna/maps.png",
  focus = [0.5, 0.5],
  style,
  className = "",
}: SavannaDepthShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;

    let animId = 0;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, "p");
    gl.linkProgram(prog);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const ur = U("r"), ut = U("t"), um = U("m"), uo = U("o"), uia = U("ia");
    gl.uniform1i(U("img"), 0);
    gl.uniform1i(U("maps"), 1);

    const loadTex = (src: string, unit: number): Promise<HTMLImageElement | null> =>
      new Promise((res) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => {
          const tex = gl.createTexture();
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
          res(im);
        };
        im.onerror = () => res(null);
        im.src = src;
      });

    let mx = 0.5, my = 0.5, tx = mx, ty = my;
    const onMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      tx = (e.clientX - b.left) / b.width;
      ty = 1 - (e.clientY - b.top) / b.height;
    };
    window.addEventListener("mousemove", onMove);

    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * d;
      canvas.height = canvas.clientHeight * d;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    Promise.all([loadTex(sceneUrl, 0), loadTex(mapsUrl, 1)]).then(([im]) => {
      if (!im) return;
      gl.uniform1f(uia, im.width / im.height);
      gl.uniform2f(uo, focus[0], focus[1]);
      const t0 = performance.now();

      const frame = (now: number) => {
        mx += (tx - mx) * 0.05;
        my += (ty - my) * 0.05;
        gl.uniform2f(ur, canvas.width, canvas.height);
        gl.uniform1f(ut, (now - t0) / 1000);
        gl.uniform2f(um, mx, my);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        animId = requestAnimationFrame(frame);
      };
      animId = requestAnimationFrame(frame);
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [sceneUrl, mapsUrl, focus]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

export default SavannaDepthShader;
