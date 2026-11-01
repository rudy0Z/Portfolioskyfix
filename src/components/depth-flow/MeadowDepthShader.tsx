"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export interface MeadowDepthShaderProps {
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

vec3 grain(vec3 c, float amt) {
  return c + (hash(gl_FragCoord.xy + fract(t * 7.0) * 91.0) - 0.5) * amt * 0.55;
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

const vec4 SCREEN = vec4(0.42, 0.456, 0.54, 0.566);
float box(vec2 p, vec4 b, float s) {
  return smoothstep(b.x - s, b.x + s, p.x) *
         smoothstep(b.z + s, b.z - s, p.x) *
         smoothstep(b.y - s, b.y + s, p.y) *
         smoothstep(b.w + s, b.w - s, p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / r;
  vec2 iu = cover(uv, 1.08);
  iu = parallax(iu, camMove(0.012, 0.11), 0.25);
  float d = depthAt(iu);

  // Curl wind field: gusts roll across meadow
  float gust = 0.5 + 0.5 * sin(t * 0.5 - iu.x * 3.0) * dn(vec2(t * 0.3, iu.x * 2.0));
  float steady = 1.0 - box(iu, vec4(0.38, 0.36, 0.6, 0.6), 0.03);
  float sway = smoothstep(0.15, 0.6, d) * steady;
  iu.x += (sin(t * 1.7 + iu.x * 14.0 + iu.y * 6.0) * 0.6 + sin(t * 2.9 - iu.x * 23.0) * 0.4) * 0.0045 * sway * (0.4 + gust);
  iu.y += sin(t * 1.3 + iu.x * 11.0) * 0.0015 * sway;

  vec3 c = textureLod(img, iu, 0.0).rgb;

  // Console screen scanlines, CRT flicker & breathing emissive glow
  float sc = box(iu, SCREEN, 0.006);
  float scan = 0.5 + 0.5 * sin((iu.y - t * 0.06) * 900.0);
  float roll = smoothstep(0.0, 0.03, abs(fract(iu.y * 8.0 - t * 0.4) - 0.5));
  float flick = 0.94 + 0.06 * dn(vec2(t * 14.0, 0.0));
  c = mix(c, c * flick * (0.96 + 0.04 * scan) * (0.94 + 0.06 * roll), sc);

  vec2 gp = (iu - vec2(0.48, 0.5)) * vec2(ia, 1.0);
  c += vec3(0.55, 1.0, 0.8) * exp(-dot(gp, gp) * 55.0) * (0.05 + 0.04 * sin(t * 1.1)) * (1.0 - sc);

  // Petals tumbling through 3D air
  float skyM = 1.0 - smoothstep(0.08, 0.2, d);
  for(int i = 0; i < 7; i++) {
    float fi = float(i);
    float sp = 0.025 + 0.02 * hash(vec2(fi, 3.0));
    vec2 p = vec2(fract(hash(vec2(fi, 1.0)) + t * sp), 0.62 + 0.33 * hash(vec2(fi, 2.0)) + 0.03 * sin(t * 0.7 + fi * 2.0));
    vec2 q = (iu - p) * vec2(ia, 1.0);
    float a = t * (1.0 + fi * 0.3) + fi;
    q = mat2(cos(a), -sin(a), sin(a), cos(a)) * q;
    float pet = smoothstep(1.0, 0.6, length(q * vec2(260.0, 520.0)));
    vec3 pc = mix(vec3(1.0, 0.55, 0.4), vec3(1.0, 0.7, 0.85), hash(vec2(fi, 7.0)));
    c = mix(c, pc, pet * 0.85 * skyM);
  }

  fragColor = vec4(grain(c, 0.018), 1.0);
}
`;

export function MeadowDepthShader({
  sceneUrl = "https://dvklab.vercel.app/templates/meadow/scene.jpg",
  mapsUrl = "https://dvklab.vercel.app/templates/meadow/maps.png",
  focus = [0.5, 0.5],
  style,
  className = "",
}: MeadowDepthShaderProps) {
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

export default MeadowDepthShader;
