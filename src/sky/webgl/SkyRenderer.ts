/**
 * SkyRenderer — the photographic sky, framework-free.
 *
 *   const r = SkyRenderer.create(canvas);   // null → no WebGL2, use a fallback
 *   r.setLight(getLight(t));                 // whenever the clock moves
 *   r.render(nowMs, { lift, timelapseHours });
 *   r.dispose();
 *
 * Owns: one WebGL2 context, a baked 64³ noise volume, a reduced-resolution
 * cloud target and a full-resolution composite. Resolution adapts to the
 * device: if frames run long the cloud pass drops resolution, and recovers
 * when there is headroom.
 *
 * Everything it knows about colour and light comes from the LightModel, so
 * the WebGL sky and the CSS-lit page (island, cards, HUD) stay one scene.
 */

import type { LightModel } from "@/lib/lighting";
import { clamp, smoothstep } from "@/lib/color";
import { CLOUD_FRAG, COMPOSITE_FRAG, NOISE_FRAG, VERT } from "./shaders";

type Vec3 = [number, number, number];

/** Must match COMMON in shaders.ts. Horizon lands at 85 % of the height. */
const TAN_HALF = Math.tan((56 * Math.PI) / 180 / 2);
const HORIZON_Y = 0.85;
const PITCH = Math.atan((HORIZON_Y * 2 - 1) * TAN_HALF);

const NOISE_SIZE = 64;

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToLinear(hex: string): Vec3 {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h.slice(0, 6), 16);
  return [srgbToLinear(((n >> 16) & 255) / 255), srgbToLinear(((n >> 8) & 255) / 255), srgbToLinear((n & 255) / 255)];
}

const scale3 = (v: Vec3, s: number): Vec3 => [v[0] * s, v[1] * s, v[2] * s];
const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Same camera as the shader: screen uv (top-left origin) → world direction. */
export function screenToDir(u: number, v: number, aspect: number): Vec3 {
  const x = (u * 2 - 1) * aspect * TAN_HALF;
  const y = (1 - v * 2) * TAN_HALF;
  const sp = Math.sin(PITCH);
  const cp = Math.cos(PITCH);
  const d: Vec3 = [x, y * cp + sp, -y * sp + cp];
  const len = Math.hypot(d[0], d[1], d[2]);
  return [d[0] / len, d[1] / len, d[2] / len];
}

interface Uniforms {
  [name: string]: WebGLUniformLocation | null;
}

interface Program {
  prog: WebGLProgram;
  u: Uniforms;
}

export interface RenderOptions {
  /** 0..1 — camera rises through the layer as the page scrolls. */
  lift?: number;
  /** Accumulated scrubbed hours: clouds race when the clock is spun. */
  timelapseHours?: number;
  /** Freeze drift (reduced motion). */
  still?: boolean;
  /** The scene is changing quickly (scrub / scroll): favour the new frame. */
  fast?: boolean;
}

export interface Quality {
  steps: number;
  lightSteps: number;
  /** Cloud pass resolution as a fraction of CSS pixels. */
  scale: number;
  minScale: number;
  maxScale: number;
}

export class SkyRenderer {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private cloud!: Program;
  private comp!: Program;
  private noise!: WebGLTexture;
  /** Ping-pong pair: the cloud pass blends each frame into the last. */
  private cloudTex: WebGLTexture[] = [];
  private cloudFbo: WebGLFramebuffer[] = [];
  private ping = 0;
  private frame = 0;
  private historyValid = false;
  private cloudSize = [0, 0];
  private floatTarget = false;
  private vao: WebGLVertexArrayObject;
  private light: LightModel | null = null;
  private quality: Quality;
  private frameTimes: number[] = [];
  private startMs = performance.now();
  private dpr = 1;

  static create(canvas: HTMLCanvasElement, quality?: Partial<Quality>): SkyRenderer | null {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl || gl.isContextLost()) return null;
    try {
      return new SkyRenderer(canvas, gl, quality);
    } catch (err) {
      console.warn("[sky] WebGL sky unavailable, falling back:", err);
      return null;
    }
  }

  private constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, quality?: Partial<Quality>) {
    this.canvas = canvas;
    this.gl = gl;
    const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
    this.quality = {
      steps: coarse ? 80 : 120,
      lightSteps: coarse ? 4 : 5,
      scale: coarse ? 0.4 : 0.5,
      minScale: 0.28,
      maxScale: coarse ? 0.5 : 0.62,
      ...quality,
    };

    this.floatTarget = !!gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("OES_texture_float_linear");

    this.vao = gl.createVertexArray()!;
    this.cloud = this.program(CLOUD_FRAG);
    this.comp = this.program(COMPOSITE_FRAG);
    this.noise = this.bakeNoise();
  }

  /* ── setup ────────────────────────────────────────────────────────── */

  private shader(type: number, src: string) {
    const gl = this.gl;
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error(`shader compile failed: ${log}`);
    }
    return s;
  }

  private program(frag: string): Program {
    const gl = this.gl;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, this.shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, this.shader(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(`program link failed: ${gl.getProgramInfoLog(prog)}`);
    }
    const u: Uniforms = {};
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(prog, i);
      if (info) u[info.name] = gl.getUniformLocation(prog, info.name);
    }
    return { prog, u };
  }

  /** Render the Perlin–Worley volume slice by slice into a 3D texture. */
  private bakeNoise(): WebGLTexture {
    const gl = this.gl;
    const N = NOISE_SIZE;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_3D, tex);
    gl.texStorage3D(gl.TEXTURE_3D, Math.log2(N) + 1, gl.RGBA8, N, N, N);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);

    const noise = this.program(NOISE_FRAG);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, N, N);
    gl.useProgram(noise.prog);
    gl.bindVertexArray(this.vao);
    gl.uniform1f(noise.u.uSize, N);
    for (let z = 0; z < N; z++) {
      gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, tex, 0, z);
      if (z === 0 && gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error("3D noise target incomplete");
      }
      gl.uniform1f(noise.u.uZ, (z + 0.5) / N);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fbo);
    gl.deleteProgram(noise.prog);
    gl.bindTexture(gl.TEXTURE_3D, tex);
    gl.generateMipmap(gl.TEXTURE_3D);
    return tex;
  }

  private ensureTargets() {
    const gl = this.gl;
    const cssW = this.canvas.clientWidth || window.innerWidth;
    const cssH = this.canvas.clientHeight || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = Math.max(1, Math.round(cssW * this.dpr));
    const H = Math.max(1, Math.round(cssH * this.dpr));
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
    }

    const cw = Math.max(64, Math.round(cssW * this.quality.scale));
    const ch = Math.max(64, Math.round(cssH * this.quality.scale));
    if (cw === this.cloudSize[0] && ch === this.cloudSize[1] && this.cloudTex.length) return;

    this.cloudTex.forEach((t) => gl.deleteTexture(t));
    this.cloudFbo.forEach((f) => gl.deleteFramebuffer(f));
    this.cloudTex = [];
    this.cloudFbo = [];
    for (let i = 0; i < 2; i++) {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, this.floatTarget ? gl.RGBA16F : gl.RGBA8, cw, ch);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.cloudTex.push(tex);
      this.cloudFbo.push(fbo);
      if (!ok && this.floatTarget) {
        // Half-float advertised but not renderable here — retry in 8-bit.
        this.floatTarget = false;
        this.cloudSize = [0, 0];
        this.ensureTargets();
        return;
      }
    }
    this.cloudSize = [cw, ch];
    this.historyValid = false;
  }

  /* ── light ────────────────────────────────────────────────────────── */

  setLight(light: LightModel) {
    this.light = light;
  }

  /** Light model → shader uniforms. Linear-light colours throughout. */
  private lightUniforms(aspect: number) {
    const L = this.light!;
    const p = L.palette;
    const sunAlt = L.sun.altitude;
    const sunDir = screenToDir(L.sun.x, L.sun.y, aspect);
    const moonDir = screenToDir(L.moon.x, L.moon.y, aspect);

    // Key light: the sun until well after it sets (clouds stay lit from
    // below through civil twilight), then the moon.
    const sunKey = smoothstep(-0.24, -0.02, sunAlt);
    const moonKey = (1 - smoothstep(-0.26, -0.08, sunAlt)) * smoothstep(-0.05, 0.12, L.moon.altitude) * (0.25 + 0.75 * L.moonIllumination);
    const useSun = sunKey >= moonKey;

    const lit = hexToLinear(L.cloud.lit);
    const keyColor = useSun
      ? scale3(lit, 0.2 + 0.95 * smoothstep(-0.2, 0.3, sunAlt) + 0.25 * L.golden)
      : scale3(mix3(lit, [0.62, 0.7, 0.86], 0.4), 0.55 * moonKey);

    const zenith = hexToLinear(p.zenith);
    const mid = hexToLinear(p.mid);
    const horizon = hexToLinear(p.horizon);
    const shadow = hexToLinear(p.cloudShadow);
    const haze = hexToLinear(p.haze);
    const ambTop = scale3(mix3(zenith, mid, 0.5), 1.0);
    const ambBottom = scale3(mix3(shadow, haze, 0.2), 0.62);

    return {
      zenith,
      mid,
      horizon,
      haze,
      glow: hexToLinear(p.sunGlow),
      sunCore: hexToLinear(p.sunCore),
      rim: scale3(hexToLinear(L.cloud.rim), useSun ? 0.6 + L.golden * 0.9 : 0.25 * moonKey),
      sunDir,
      moonDir,
      keyDir: useSun ? sunDir : moonDir,
      keyColor,
      ambTop,
      ambBottom,
      sunVis: L.sun.opacity,
      glowAmt: clamp(smoothstep(-0.28, 0.0, sunAlt) * (0.55 + 0.45 * L.golden + 0.3 * L.twilight)),
      moonVis: L.moon.opacity,
      moonPhase: L.moonPhase,
      moonIllum: L.moonIllumination,
      stars: L.starOpacity,
      // a little more cloud at the ends of the day reads as weather; clearer
      // nights so the stars come through
      coverage: 0.5 + 0.06 * L.golden - 0.14 * (1 - smoothstep(-0.3, 0.0, sunAlt)),
      fogK: 0.052 + 0.02 * (1 - L.daylight),
    };
  }

  /* ── frame ────────────────────────────────────────────────────────── */

  render(nowMs: number, opts: RenderOptions = {}) {
    if (!this.light) return;
    const gl = this.gl;
    this.ensureTargets();

    const cssW = this.canvas.clientWidth || window.innerWidth;
    const cssH = this.canvas.clientHeight || window.innerHeight;
    const aspect = cssW / cssH;
    const u = this.lightUniforms(aspect);

    const secs = opts.still ? 0 : (nowMs - this.startMs) / 1000;
    const drift = secs * 0.014 + (opts.timelapseHours ?? 0) * 1.8;
    const wind: Vec3 = [drift, 0, -drift * 0.35];
    const detailWind: Vec3 = [drift * 0.25, -secs * 0.004, drift * 0.1];
    const outScale = this.floatTarget ? 1 : 0.25;

    gl.bindVertexArray(this.vao);

    /* clouds — written into one target while reading the other as history */
    const c = this.cloud;
    const src = this.ping;
    const dst = 1 - this.ping;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.cloudFbo[dst]);
    gl.viewport(0, 0, this.cloudSize[0], this.cloudSize[1]);
    gl.useProgram(c.prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, this.noise);
    gl.uniform1i(c.u.uNoise, 0);
    this.common(c, this.cloudSize[0], this.cloudSize[1], aspect, u);
    gl.uniform1f(c.u.uCamY, (opts.lift ?? 0) * 0.55);
    gl.uniform3fv(c.u.uWind, wind);
    gl.uniform3fv(c.u.uDetailWind, detailWind);
    gl.uniform1f(c.u.uCoverage, u.coverage);
    gl.uniform1f(c.u.uDensity, 44);
    gl.uniform3fv(c.u.uKeyDir, u.keyDir);
    gl.uniform3fv(c.u.uKeyColor, u.keyColor);
    gl.uniform3fv(c.u.uAmbTop, u.ambTop);
    gl.uniform3fv(c.u.uAmbBottom, u.ambBottom);
    gl.uniform3fv(c.u.uRim, u.rim);
    gl.uniform1f(c.u.uFogK, u.fogK);
    gl.uniform1f(c.u.uOutScale, outScale);
    gl.uniform1i(c.u.uSteps, this.quality.steps);
    gl.uniform1i(c.u.uLightSteps, this.quality.lightSteps);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.cloudTex[src]);
    gl.uniform1i(c.u.uHistory, 2);
    // Light history while things move fast, deeper when the scene is calm.
    gl.uniform1f(c.u.uBlend, this.historyValid ? (opts.fast ? 0.45 : 0.12) : 1);
    gl.uniform1f(c.u.uFrame, this.frame++ % 1024);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.ping = dst;
    this.historyValid = true;

    /* composite */
    const k = this.comp;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(k.prog);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.cloudTex[dst]);
    gl.uniform1i(k.u.uClouds, 1);
    this.common(k, this.canvas.width, this.canvas.height, aspect, u);
    gl.uniform2f(k.u.uCloudRes, this.cloudSize[0], this.cloudSize[1]);
    gl.uniform1f(k.u.uOutScale, outScale);
    gl.uniform1f(k.u.uTime, secs);
    gl.uniform1f(k.u.uDpr, this.dpr);
    gl.uniform3fv(k.u.uSunCore, u.sunCore);
    gl.uniform3fv(k.u.uMoonDir, u.moonDir);
    gl.uniform1f(k.u.uMoonVis, u.moonVis);
    gl.uniform1f(k.u.uMoonPhase, u.moonPhase);
    gl.uniform1f(k.u.uMoonIllum, u.moonIllum);
    gl.uniform1f(k.u.uStars, u.stars);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private common(p: Program, w: number, h: number, aspect: number, u: ReturnType<SkyRenderer["lightUniforms"]>) {
    const gl = this.gl;
    gl.uniform2f(p.u.uRes, w, h);
    gl.uniform1f(p.u.uAspect, aspect);
    gl.uniform1f(p.u.uTanHalf, TAN_HALF);
    gl.uniform2f(p.u.uPitch, Math.sin(PITCH), Math.cos(PITCH));
    gl.uniform3fv(p.u.uZenith, u.zenith);
    gl.uniform3fv(p.u.uMid, u.mid);
    gl.uniform3fv(p.u.uHorizon, u.horizon);
    gl.uniform3fv(p.u.uHaze, u.haze);
    gl.uniform3fv(p.u.uGlow, u.glow);
    gl.uniform3fv(p.u.uSunDir, u.sunDir);
    gl.uniform1f(p.u.uSunVis, u.sunVis);
    gl.uniform1f(p.u.uGlowAmt, u.glowAmt);
  }

  /**
   * Dynamic resolution. The caller reports the rAF interval that *followed* a
   * rendered frame — the frame's real cost as the display saw it (idle frames
   * are throttled on purpose, so the gap between renders says nothing).
   * Clouds are soft, so 0.3× still reads well.
   */
  sampleFrame(dtMs: number) {
    if (dtMs <= 0 || dtMs > 250) return;
    this.frameTimes.push(dtMs);
    if (this.frameTimes.length < 30) return;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const median = sorted[sorted.length >> 1];
    this.frameTimes.length = 0;
    const q = this.quality;
    const before = q.scale;
    if (median > 21 && q.scale > q.minScale) q.scale = Math.max(q.minScale, q.scale * 0.85);
    else if (median < 17.5 && q.scale < q.maxScale) q.scale = Math.min(q.maxScale, q.scale * 1.05);
    if (q.scale !== before) this.historyValid = false;
  }

  /** Forget frame history (e.g. after a pause) so adaptation is not skewed. */
  resetTiming() {
    this.frameTimes.length = 0;
  }

  get qualityState(): Readonly<Quality> {
    return this.quality;
  }

  dispose() {
    const gl = this.gl;
    gl.deleteProgram(this.cloud.prog);
    gl.deleteProgram(this.comp.prog);
    gl.deleteTexture(this.noise);
    this.cloudTex.forEach((t) => gl.deleteTexture(t));
    this.cloudFbo.forEach((f) => gl.deleteFramebuffer(f));
    gl.deleteVertexArray(this.vao);
    // No loseContext(): React StrictMode remounts reuse this canvas, and a
    // canvas hands back the same (now lost) context forever after.
  }
}
