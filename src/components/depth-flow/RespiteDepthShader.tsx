"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export interface RespiteDepthShaderProps {
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

float butterfly(vec2 q, float s, float ph) {
  q /= s;
  q.x = abs(q.x);
  float flap = sin(ph);
  float wing = smoothstep(0.8, 0.0, length(q - vec2(0.4 * flap, 0.0)));
  return wing;
}

void main() {
  vec2 uv = gl_FragCoord.xy / r;
  vec2 iu = cover(uv, 1.05);
  vec2 cam = camMove(0.015, 0.09);
  vec2 ip = parallax(iu, cam, 0.3);

  // Soft canopy wind sway
  float d = depthAt(ip);
  float canopy = smoothstep(0.65, 0.95, ip.y) * smoothstep(0.2, 0.6, d);
  vec2 sw = vec2(sin(t * 1.1 + ip.x * 7.0) * 0.003, sin(t * 1.4 + ip.x * 9.0) * 0.0012) * canopy;

  // Cloud drift
  vec2 cd = (drift(ip, 0.03, 0.025) - ip) * smoothstep(0.05, 0.25, 1.0 - d);

  vec2 q = ip + sw + cd;
  vec3 col = texture(img, clamp(q, 0.001, 0.999)).rgb;

  // Dappled light sliding over terrain
  vec2 dp = q * vec2(9.0, 14.0) + vec2(t * 0.12, t * 0.05);
  float dap = smoothstep(0.45, 0.75, dn(dp) * 0.65 + dn(dp * 2.2 + 3.0) * 0.35);
  col *= 1.0 + (dap - 0.45) * 0.35 * smoothstep(0.2, 0.8, d);

  // Metal specular star glint
  vec2 gp = (q - vec2(0.25, 0.55)) * vec2(ia, 1.0);
  float star = exp(-length(gp) * 90.0) + exp(-abs(gp.x) * 600.0 - abs(gp.y) * 45.0);
  col += vec3(1.0, 0.95, 0.8) * star * (0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * 0.9), 6.0));

  // Butterflies flitting through foreground
  for(int i = 0; i < 3; i++) {
    float k = float(i);
    vec2 bp = vec2(0.55 + 0.25 * sin(t * 0.21 + k * 2.1), 0.62 + 0.12 * sin(t * 0.17 + k * 1.3));
    vec2 bq = (q - bp) * vec2(ia, 1.0);
    float b = butterfly(bq, 0.015, t * (14.0 + k * 3.0));
    col = mix(col, vec3(1.0, 0.6, 0.2), b * 0.85);
  }

  fragColor = vec4(col, 1.0);
}
`;

export function RespiteDepthShader({
  sceneUrl = "https://dvklab.vercel.app/templates/respite/scene.jpg",
  mapsUrl = "https://dvklab.vercel.app/templates/respite/maps.png",
  focus = [0.5, 0.5],
  style,
  className = "",
}: RespiteDepthShaderProps) {
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

export default RespiteDepthShader;
