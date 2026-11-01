/**
 * GLSL for the photographic sky.
 *
 * Three programs share one full-screen triangle:
 *
 *   NOISE      runs once at start-up. Bakes a tileable 64³ Perlin–Worley
 *              volume (R = billowy shape, GBA = Worley fBm at three
 *              frequencies) — the same family of noise film/game cloud
 *              renderers use, because inverted Worley cells read as the
 *              rounded "cauliflower" lobes of real cumulus.
 *   CLOUDS     ray-marches a cumulus layer at reduced resolution. Each sample
 *              is lit by a short march toward the key light (Beer–Lambert),
 *              a dual-lobe phase function (silver lining into the sun) and a
 *              three-octave multiple-scattering approximation, then fogged
 *              into the sky with distance (aerial perspective).
 *   COMPOSITE  runs at full resolution: atmospheric sky, sun with limb
 *              darkening, a phase-correct moon, stars and a faint Milky Way,
 *              the up-sampled clouds, lens glare, highlight roll-off and grain.
 *
 * Units are kilometres. The camera sits inside the cloud layer — this is a
 * floating island, so the clouds surround us rather than hang overhead.
 */

export const VERT = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

/* ── noise bake ───────────────────────────────────────────────────────── */

export const NOISE_FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform float uZ;
uniform float uSize;
out vec4 outColor;

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

vec3 grad(vec3 p) {
  return normalize(hash33(p) * 2.0 - 1.0 + 1e-4);
}

// Tileable gradient noise with integer period.
float gnoise(vec3 x, float period) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n000 = dot(grad(mod(i + vec3(0,0,0), period)), f - vec3(0,0,0));
  float n100 = dot(grad(mod(i + vec3(1,0,0), period)), f - vec3(1,0,0));
  float n010 = dot(grad(mod(i + vec3(0,1,0), period)), f - vec3(0,1,0));
  float n110 = dot(grad(mod(i + vec3(1,1,0), period)), f - vec3(1,1,0));
  float n001 = dot(grad(mod(i + vec3(0,0,1), period)), f - vec3(0,0,1));
  float n101 = dot(grad(mod(i + vec3(1,0,1), period)), f - vec3(1,0,1));
  float n011 = dot(grad(mod(i + vec3(0,1,1), period)), f - vec3(0,1,1));
  float n111 = dot(grad(mod(i + vec3(1,1,1), period)), f - vec3(1,1,1));
  return mix(
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
    u.z);
}

float perlinFbm(vec3 p, float freq) {
  float amp = 1.0, sum = 0.0, norm = 0.0;
  for (int i = 0; i < 6; i++) {
    sum += amp * gnoise(p * freq, freq);
    norm += amp;
    freq *= 2.0;
    amp *= 0.55;
  }
  return sum / norm * 1.6;
}

// 1 − distance to nearest feature point: bright, rounded cells.
float worley(vec3 p, float period) {
  vec3 id = floor(p);
  vec3 f = fract(p);
  float d = 1e9;
  for (int x = -1; x <= 1; x++)
  for (int y = -1; y <= 1; y++)
  for (int z = -1; z <= 1; z++) {
    vec3 o = vec3(x, y, z);
    vec3 r = o + hash33(mod(id + o, period)) - f;
    d = min(d, dot(r, r));
  }
  return 1.0 - sqrt(d);
}

float worleyFbm(vec3 p, float freq) {
  return worley(p * freq, freq) * 0.625
       + worley(p * freq * 2.0, freq * 2.0) * 0.25
       + worley(p * freq * 4.0, freq * 4.0) * 0.125;
}

float remap(float x, float a, float b, float c, float d) {
  return c + (x - a) / (b - a) * (d - c);
}

void main() {
  vec3 p = vec3(gl_FragCoord.xy / uSize, uZ);
  // Raw ranges (measured): Perlin fBm 0.32–0.69, Worley fBm 0.23–0.75.
  // Stretch both to fill 8 bits, otherwise thresholds band visibly.
  float pn = clamp((perlinFbm(p, 4.0) * 0.5 + 0.5 - 0.5) * 2.6 + 0.5, 0.0, 1.0);
  float g = clamp((worleyFbm(p, 4.0) - 0.49) * 1.9 + 0.5, 0.0, 1.0);
  float b = clamp((worleyFbm(p, 8.0) - 0.49) * 1.9 + 0.5, 0.0, 1.0);
  float a = clamp((worleyFbm(p, 16.0) - 0.49) * 1.9 + 0.5, 0.0, 1.0);
  // Perlin–Worley: Perlin gives the large connected masses, the Worley
  // cells round them into lobes.
  float r = clamp(((pn * 0.55 + g * 0.45) - 0.5) * 1.5 + 0.5, 0.0, 1.0);
  outColor = vec4(r, g, b, a);
}`;

/* ── shared: camera + sky ─────────────────────────────────────────────── */

const COMMON = /* glsl */ `
uniform vec2 uRes;
uniform float uAspect;
uniform float uTanHalf;
uniform vec2 uPitch;          // sin, cos

uniform vec3 uZenith;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform vec3 uHaze;
uniform vec3 uGlow;
uniform vec3 uSunDir;
uniform float uSunVis;        // 0..1 above-horizon visibility
uniform float uGlowAmt;       // how much the sun lights the air (0 at night)

const float PI = 3.14159265;

float sstep(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

// uv: 0..1, origin top-left (matches CSS --sun-x / --sun-y)
vec3 camRay(vec2 uv) {
  float x = (uv.x * 2.0 - 1.0) * uAspect * uTanHalf;
  float y = (1.0 - uv.y * 2.0) * uTanHalf;
  vec3 f = vec3(0.0, uPitch.x, uPitch.y);
  vec3 up = vec3(0.0, uPitch.y, -uPitch.x);
  return normalize(vec3(x, 0.0, 0.0) + up * y + f);
}

/*
 * The art-directed palette mapped onto elevation. The stops reproduce the
 * CSS gradient (zenith 0–22 %, mid 58–68 %, horizon 84 %, haze 96 %) for this
 * camera, but blended in linear light — which is what removes the "flat
 * gradient" look — plus forward scattering toward the sun and a darker
 * anti-solar sky.
 */
vec3 skyColor(vec3 rd) {
  float e = degrees(asin(clamp(rd.y, -1.0, 1.0)));
  vec3 c = mix(uZenith, uMid, sstep(40.0, 13.0, e));
  c = mix(c, uHorizon, sstep(10.0, 0.4, e));
  c = mix(c, uHaze, sstep(1.6, -4.5, e));
  // below the horizon: the haze thickens into the cloud sea
  c = mix(c, mix(uHaze, uHorizon, 0.55) * 0.92, sstep(-5.0, -28.0, e));

  float mu = dot(rd, uSunDir);
  float m = max(mu, 0.0);
  float low = exp(-max(e, 0.0) / 9.0);               // strongest at the horizon
  vec3 glow = uGlow * uGlowAmt;
  c += glow * (pow(m, 6.0) * (0.22 + 0.5 * low) + pow(m, 2.0) * 0.08 * low);
  // horizon band brightens all round, warm toward the sun
  c += mix(uHorizon, uGlow, 0.35 * m) * 0.05 * low * uGlowAmt;
  // anti-solar side is a touch deeper
  c *= 1.0 - 0.07 * max(-mu, 0.0) * (1.0 - low);
  return c;
}
`;

/* ── cloud march ──────────────────────────────────────────────────────── */

export const CLOUD_FRAG = /* glsl */ `#version 300 es
precision highp float;
precision highp sampler3D;
${COMMON}
uniform sampler3D uNoise;
uniform float uCamY;
uniform vec3 uWind;
uniform vec3 uDetailWind;
uniform float uCoverage;
uniform float uDensity;
uniform vec3 uKeyDir;
uniform vec3 uKeyColor;
uniform vec3 uAmbTop;
uniform vec3 uAmbBottom;
uniform vec3 uRim;
uniform float uFogK;
uniform float uOutScale;
uniform int uSteps;
uniform int uLightSteps;
uniform sampler2D uHistory;
uniform float uBlend;        // 1 = no history (first frame / resize)
uniform float uFrame;
out vec4 outColor;

const float BASE = -0.9;
const float TOP = 4.4;
const float MAXD = 42.0;

float remap(float x, float a, float b, float c, float d) {
  return c + (x - a) / (b - a) * (d - c);
}

float hg(float mu, float g) {
  float g2 = g * g;
  return (1.0 - g2) / pow(1.0 + g2 - 2.0 * g * mu, 1.5);   // ×4π-normalised
}

// Weather: where clouds are, and how tall they grow. Worley cells give
// clustered cumulus with clear sky between them. Cheap (one fetch), so the
// march can stride through clear air without touching the 3D shape noise.
float coverage(vec3 q) {
  float w1 = textureLod(uNoise, vec3(q.xz * 0.036, 0.31), 0.0).g;
  float w2 = textureLod(uNoise, vec3(q.zx * 0.09 + 0.37, 0.77), 0.0).r;
  return sstep(0.4, 0.78, w1 * 0.7 + w2 * 0.3 + uCoverage - 0.5);
}

vec3 windPos(vec3 p, float h) {
  // shear: tops lean downwind
  return p + uWind + vec3(h * 0.9, 0.0, h * 0.25);
}

float shapeDensity(vec3 q, float h, float cov, bool detail, float lod) {
  // flat bases, rounded tops; taller where coverage is strong
  float top = 0.25 + 0.75 * cov;
  float prof = sstep(0.0, 0.045, h) * sstep(top, top * 0.38, h);

  // vertical frequency higher than horizontal: stacked turrets, not columns
  float R = textureLod(uNoise, q * vec3(0.27, 0.44, 0.27), lod).r;
  float th = 1.0 - 0.62 * cov;
  float d = (R * prof - th) / (1.0 - th);
  if (!detail || d <= 0.0) return max(d, 0.0);

  // erosion: wispy at the base, billowed higher up
  vec3 dn = textureLod(uNoise, (q + uDetailWind) * vec3(1.9, 2.4, 1.9), lod).gba;
  float df = dn.x * 0.625 + dn.y * 0.25 + dn.z * 0.125;
  float em = mix(1.0 - df, df, sstep(0.0, 0.25, h));
  d = (d - em * 0.36) / (1.0 - em * 0.36);
  return max(d, 0.0);
}

float density(vec3 p, bool detail, float lod) {
  float h = (p.y - BASE) / (TOP - BASE);
  if (h <= 0.0 || h >= 1.0) return 0.0;
  vec3 q = windPos(p, h);
  float cov = coverage(q);
  if (cov <= 0.001) return 0.0;
  return shapeDensity(q, h, cov, detail, lod);
}

float lightDepth(vec3 p, float lod) {
  float od = 0.0;
  float ds = 0.04;
  float s = 0.0;
  for (int j = 0; j < 8; j++) {
    if (j >= uLightSteps) break;
    s += ds * 0.5;
    od += density(p + uKeyDir * s, j < 2, lod) * ds;
    s += ds * 0.5;
    ds *= 1.9;
  }
  return od * uDensity;
}

// Interleaved gradient noise — a stable per-pixel dither for the start depth.
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
  vec3 rd = camRay(uv);
  vec3 ro = vec3(0.0, uCamY, 0.0);

  // slab intersection
  float t0 = 0.0, t1 = MAXD;
  if (abs(rd.y) > 1e-5) {
    float a = (BASE - ro.y) / rd.y;
    float b = (TOP - ro.y) / rd.y;
    t0 = max(min(a, b), 0.0);
    t1 = min(max(a, b), MAXD);
  }
  if (t1 <= t0) { outColor = vec4(0.0); return; }

  vec3 fogCol = skyColor(rd);
  float mu = dot(rd, uKeyDir);
  // phase: strong forward lobe (silver lining) + soft back-scatter
  float phF = hg(mu, 0.68);
  float phB = hg(mu, -0.22);
  float ph = mix(phF, phB, 0.5);

  // per-pixel noise, rotated by the golden ratio each frame: every pixel
  // walks a well-spread sequence of offsets, so the history converges evenly
  float j = fract(ign(gl_FragCoord.xy) + uFrame * 0.618034);
  float t = t0;
  float T = 1.0;
  vec3 col = vec3(0.0);
  int fine = 0;

  for (int i = 0; i < 160; i++) {
    if (i >= uSteps || t > t1 || T < 0.015) break;
    float dt = clamp(0.024 + t * 0.018, 0.024, 0.9);
    // Sample somewhere inside this step, by a fraction of the step itself.
    // A fixed start offset is too small far away, and every pixel then
    // samples the same depth shells — which shows as contour ribbing.
    float ts = t + j * dt;
    vec3 p = ro + rd * ts;
    float h = (p.y - BASE) / (TOP - BASE);
    vec3 q = windPos(p, h);

    // clear air by the weather map alone: long strides
    float cov = (h > 0.0 && h < 1.0) ? coverage(q) : 0.0;
    if (cov <= 0.001) { t += dt * 2.6; fine = 0; continue; }

    float lod = clamp(log2(1.0 + ts * 0.35), 0.0, 3.0);
    float dc = shapeDensity(q, h, cov, false, lod);
    if (dc <= 0.0) {
      t += fine > 0 ? dt : dt * 1.6;
      fine--;
      continue;
    }
    // first touch after a long stride: back up one fine step, then walk in
    if (fine <= 0) { fine = 3; t = max(t - dt, t0); continue; }
    fine = 3;

    float d = shapeDensity(q, h, cov, true, lod);
    // Near the camera clouds thin out along the ray rather than being cut by
    // a shape: rays are radial, so no edge can ever be seen side-on.
    d *= sstep(0.7, 2.4, ts);
    if (d > 0.002) {
      float sigma = d * uDensity;
      float od = lightDepth(p, lod);

      // three octaves of attenuated scattering ≈ multiple scattering
      float ms = exp(-od) * ph
               + 0.45 * exp(-od * 0.28) * mix(ph, 1.0, 0.6)
               + 0.16 * exp(-od * 0.09);
      // powder: sun-side edges darken slightly where the cloud is thin
      float powder = mix(1.0, 1.0 - exp(-sigma * 0.18), 0.5 * (1.0 - max(mu, 0.0)));
      vec3 sun = uKeyColor * ms * powder;
      sun += uRim * exp(-od * 0.8) * pow(max(mu, 0.0), 10.0) * 0.9;

      // sky light from above, bounce from below; deep interiors see less of both
      vec3 amb = mix(uAmbBottom, uAmbTop, sstep(0.02, 0.7, h));
      amb *= 0.5 + 0.5 * exp(-sigma * 0.05);

      vec3 L = sun + amb;
      float fog = 1.0 - exp(-ts * uFogK);
      L = mix(L, fogCol, fog);

      float Ts = exp(-sigma * dt);
      col += T * L * (1.0 - Ts);
      T *= Ts;
    }
    t += dt;
  }

  vec4 cur = vec4(col * uOutScale, 1.0 - T);
  vec4 hist = texture(uHistory, gl_FragCoord.xy / uRes);
  outColor = mix(hist, cur, uBlend);
}`;

/* ── composite ────────────────────────────────────────────────────────── */

export const COMPOSITE_FRAG = /* glsl */ `#version 300 es
precision highp float;
${COMMON}
uniform sampler2D uClouds;
uniform vec2 uCloudRes;
uniform float uOutScale;
uniform float uTime;
uniform float uDpr;

uniform vec3 uSunCore;
uniform vec3 uMoonDir;
uniform float uMoonVis;
uniform float uMoonPhase;
uniform float uMoonIllum;
uniform float uStars;
out vec4 outColor;

float h12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 h22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), f.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), f.x), f.y);
}
float fbm2(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}

// Catmull-Rom-ish 4-tap bicubic: keeps cloud edges crisp after up-sampling.
vec4 sampleClouds(vec2 uv) {
  vec2 pos = uv * uCloudRes - 0.5;
  vec2 f = fract(pos);
  vec2 c = floor(pos) + 0.5;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 o12 = w2 / w12;
  vec2 t0 = (c - 1.0) / uCloudRes;
  vec2 t3 = (c + 2.0) / uCloudRes;
  vec2 t12 = (c + o12) / uCloudRes;
  vec4 r = vec4(0.0);
  r += texture(uClouds, vec2(t12.x, t0.y)) * w12.x * w0.y;
  r += texture(uClouds, vec2(t0.x, t12.y)) * w0.x * w12.y;
  r += texture(uClouds, vec2(t12.x, t12.y)) * w12.x * w12.y;
  r += texture(uClouds, vec2(t3.x, t12.y)) * w3.x * w12.y;
  r += texture(uClouds, vec2(t12.x, t3.y)) * w12.x * w3.y;
  float wsum = w12.x * w0.y + w0.x * w12.y + w12.x * w12.y + w3.x * w12.y + w12.x * w3.y;
  return max(r / wsum, 0.0);
}

vec3 starfield(vec2 frag, vec3 rd) {
  if (uStars <= 0.001) return vec3(0.0);
  float cell = 3.0 * uDpr;
  vec2 g = floor(frag / cell);
  float rnd = h12(g);
  float mw = 0.0;
  // a faint Milky Way: a tilted band of mottled light
  vec2 sp = frag / (uRes.y);
  float band = exp(-pow((sp.y - 0.62 + (sp.x - 0.5) * 0.55) * 4.2, 2.0));
  mw = band * (0.55 + 0.45 * fbm2(sp * 6.0)) * (0.6 + 0.4 * fbm2(sp * 22.0));
  float thresh = 0.987 - band * 0.03;
  vec3 col = vec3(0.62, 0.68, 0.85) * mw * 0.035;
  if (rnd > thresh) {
    vec2 o = h22(g + 3.1);
    vec2 c = (g + 0.2 + o * 0.6) * cell;
    float dist = length(frag - c) / uDpr;
    float mag = pow(h12(g + 9.7), 7.0);
    float size = 0.55 + mag * 1.1;
    float core = exp(-dist * dist / (size * size));
    float tw = 0.78 + 0.22 * sin(uTime * (0.6 + rnd * 2.0) + rnd * 60.0);
    vec3 tint = mix(vec3(0.75, 0.83, 1.0), vec3(1.0, 0.88, 0.74), h12(g + 1.3));
    col += tint * core * (0.022 + mag * 2.4) * tw;
  }
  float ext = sstep(-0.02, 0.22, rd.y);    // atmospheric extinction near the horizon
  return col * uStars * ext;
}

vec3 moonDisc(vec3 rd) {
  if (uMoonVis <= 0.001) return vec3(0.0);
  float R = radians(1.15);
  vec3 md = uMoonDir;
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), md));
  vec3 up = cross(md, rt);
  float z = dot(rd, md);
  vec2 l = vec2(dot(rd, rt), dot(rd, up)) / tan(R);
  float r = length(l);
  float ang = acos(clamp(z, -1.0, 1.0));
  vec3 halo = vec3(0.78, 0.84, 1.0) * (exp(-ang * 28.0) * 0.16 + exp(-ang * 7.0) * 0.035) * (0.3 + uMoonIllum);
  if (z < 0.0 || r > 1.2) return halo * uMoonVis;
  float edge = 1.0 - sstep(0.96, 1.0, r);
  vec3 n = vec3(l.x, l.y, sqrt(max(1.0 - r * r, 0.0)));
  float ph = uMoonPhase * 2.0 * PI;
  vec3 L = normalize(vec3(sin(ph), 0.0, -cos(ph)));
  float lit = sstep(-0.04, 0.12, dot(n, L));
  float maria = fbm2(l * 2.4 + 4.0);
  float albedo = 0.78 + 0.22 * sstep(0.35, 0.7, maria);
  float limb = 0.72 + 0.28 * n.z;
  vec3 surf = vec3(1.0, 0.98, 0.94) * albedo * limb * (lit * 2.6 + 0.035);
  return (surf * edge + halo) * uMoonVis;
}

vec3 sunDisc(vec3 rd, out float glare) {
  float mu = dot(rd, uSunDir);
  float ang = acos(clamp(mu, -1.0, 1.0));
  float R = radians(0.95);
  float disc = 1.0 - sstep(R * 0.86, R, ang);
  float rr = clamp(ang / R, 0.0, 1.0);
  float limb = 1.0 - 0.45 * (1.0 - sqrt(1.0 - rr * rr));
  glare = exp(-ang * 70.0) * 2.0 + exp(-ang * 14.0) * 0.3 + exp(-ang * 4.0) * 0.05;
  return uSunCore * disc * limb * 24.0 * uSunVis;
}

// Highlight roll-off: identity through the mid-tones, filmic shoulder above.
vec3 shoulder(vec3 c) {
  vec3 k = vec3(0.62);
  vec3 over = max(c - k, 0.0);
  return min(c, k) + (1.0 - k) * (1.0 - exp(-over / (1.0 - k)));
}

vec3 toSRGB(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
  vec3 rd = camRay(uv);

  vec3 col = skyColor(rd);
  col += starfield(gl_FragCoord.xy * vec2(1.0, -1.0) + vec2(0.0, uRes.y), rd);
  col += moonDisc(rd);
  float glare;
  col += sunDisc(rd, glare);

  vec4 cl = sampleClouds(vec2(uv.x, 1.0 - uv.y));
  cl.rgb /= uOutScale;
  float a = clamp(cl.a, 0.0, 1.0);
  col = col * (1.0 - a) + cl.rgb;

  // lens glare survives in front of thin cloud
  col += uGlow * glare * uSunVis * (1.0 - a * 0.75) * 0.6;

  col = shoulder(col);
  // gentle vignette — a lens, not an effect
  vec2 vq = uv - 0.5;
  col *= 1.0 - 0.16 * dot(vq, vq);

  vec3 outc = toSRGB(col);
  float grain = (h12(gl_FragCoord.xy + fract(uTime * 7.3) * 113.0) - 0.5) / 255.0 * 2.2;
  outColor = vec4(outc + grain, 1.0);
}`;
