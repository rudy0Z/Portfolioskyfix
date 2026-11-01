// Bluebell Pass — Originkit

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const MOVED_CONTROLS: { into: Record<string, string>; out: Record<string, string> } = {"into":{},"out":{"hover":"advanced"}}
const GROUP_FALLBACKS: Record<string, any> = {  }
function withMovedControls(props: any): any {
    const out = { ...props }
    for (const [k, g] of Object.entries(MOVED_CONTROLS.into)) out[k] = props?.[g]?.[k] ?? GROUP_FALLBACKS[g]?.[k]
    for (const [k, g] of Object.entries(MOVED_CONTROLS.out)) {
        if (out[k] !== undefined) out[g] = { ...(out[g] ?? {}), [k]: out[k] }
    }
    return out
}

const DEFAULT_ADVANCED = {
    seed: 7,
    horizonY: 50,
    carpetCount: 3500,
    flowerCount: 420,
    grassCount: 1600,
    pebbleCount: 20,
    squash: 62,
    skyTop: "#021649",
    skyMid: "#013C97",
    skyHorizon: "#0252C4",
    cloudColor: "#0A1460",
    cloudOpacity: 55,
    milkyColor: "#B9D0FF",
    milkyOpacity: 60,
    milkyWidth: 2,
    mountainColor: "#00041A",
    rimColor: "#1E2A70",
    peakLight: "#AFC6F5",
    peakShadow: "#06227C",
    hazeColor: "#6F8FFF",
    hazeOpacity: 80,
    stemColor: "#0F5A3A",
    grassColor: "#05261B",
    grassLit: "#2E9C72",
    pathColor: "#04142C",
    // Ground gradient for the "open" landscape (far horizon → foreground).
    fieldFar: "#081E3E",
    fieldMid: "#041A1C",
    fieldNear: "#00060F",
    glowSize: 180,
    defocus: 7,
    grain: 0,
    vignette: 15,
    loopMs: 8000,
    swayAngle: 3,
    nearSway: 2,
    waveSpread: 60,
    wind: 35,
    pulse: 15,
    milkyDrift: 1,
    starDrift: 1,
    starTwinkle: 60,
    hover: 50,
    lightRadius: 22,
    lightBoost: 40,
}
type BluebellPassAdvanced = typeof DEFAULT_ADVANCED

const DEFAULT_PLACEMENT = { x: 0, y: 0, angle: 0, tilt: 0 }
type BluebellPassPlacement = typeof DEFAULT_PLACEMENT

const DEFAULT_SWAY: { lean: "toward" | "away"; reach: number; bounce: number } = {
    lean: "toward",
    reach: 5,
    bounce: 6,
}
type BluebellPassSway = typeof DEFAULT_SWAY

export type BluebellLandscape = "pass" | "open"

const DEFAULTS = {
    background: "#000000",
    sceneScale: 100,
    density: 100,
    stars: 100,
    scale: 100,
    flowerColor: "#0468FB",
    glow: 100,
    swayIntensity: 100,
    speed: 96,
    landscape: "pass" as BluebellLandscape,
    sky: true,
}

export interface BluebellPassProps {
    background?: string

    sceneScale?: number

    density?: number

    stars?: number

    scale?: number
    flowerColor?: string
    glow?: number
    placement?: Partial<BluebellPassPlacement>

    swayIntensity?: number

    sway?: Partial<BluebellPassSway>

    speed?: number
    advanced?: Partial<BluebellPassAdvanced>
    /**
     * "pass" paints the original mountain pass. "open" paints a wide meadow on a
     * long, nearly level horizon — no ridges, peaks, path or figure.
     */
    landscape?: BluebellLandscape
    /**
     * Paint the built-in night sky (gradient, clouds, Milky Way, stars). Turn it
     * off to composite the field over another sky; pair with a transparent
     * `background`.
     */
    sky?: boolean
    style?: React.CSSProperties
}

const REF_W = 1200
const REF_H = 800
const REF_ASPECT = REF_W / REF_H

const PX = 1 / 1002

const REF_U = 282 * PX

const SIZE_PER_DEPTH = 0.14

const LIVE_MIN_PX = 6

type Pt = readonly [number, number]
const W_ = (pts: readonly Pt[]): Pt[] => pts.map(([x, y]) => [(x - 282) * PX, y * PX] as const)

const LEFT_RIDGE = W_([
    [-30000, 380], [-3000, 360], [-1500, 335], [-1000, 318], [-750, 300], [-560, 310], [-420, 296],
    [-300, 266], [-200, 240], [-120, 231], [-60, 247], [0, 279], [12, 286], [24, 295], [36, 302],
    [48, 307], [60, 314], [72, 322], [84, 334], [96, 341], [108, 343], [120, 344], [132, 348],
    [144, 358], [156, 367], [168, 379], [180, 389], [192, 398], [204, 405], [216, 413], [228, 422],
    [240, 429], [252, 436], [264, 445], [276, 451], [290, 462], [305, 472], [320, 478], [340, 486],
])
const RIGHT_RIDGE = W_([
    [250, 486], [270, 482], [300, 478], [324, 471], [336, 468], [348, 463], [360, 455], [372, 450],
    [384, 444], [396, 440], [408, 435], [420, 431], [432, 427], [444, 422], [456, 416], [468, 412],
    [480, 406], [492, 403], [504, 396], [516, 392], [528, 386], [540, 381], [552, 375], [564, 369],
    [620, 346], [680, 331], [760, 322], [860, 331], [960, 350], [1060, 341], [1200, 352],
    [1500, 345], [3000, 372], [30000, 380],
])
const FAR_RANGE = W_([
    [150, 392], [165, 383], [175, 378], [184, 371], [200, 373], [211, 375], [226, 387], [235, 385],
    [249, 382], [272, 365], [285, 377], [299, 390], [310, 389], [320, 395], [345, 410], [356, 404],
    [370, 411], [382, 412], [396, 416], [410, 413], [435, 409], [447, 415], [470, 412], [520, 432],
])

const FAR_PEAKS: readonly (readonly [number, number, number])[] = [
    [9, 0.05, 14],
    [3, 0.03, 8],
    [13, 0.02, 5],
    [15, 0.018, 4],
]

const EDGE = W_([
    [-30000, 509], [-600, 509], [100, 509], [150, 489], [192, 494], [216, 498], [240, 501],
    [264, 503], [300, 503.5], [410, 503.5], [456, 500], [500, 498], [552, 496], [700, 496], [30000, 496],
])

const TERRACE = W_([
    [-30000, 452], [-900, 455], [-300, 459], [0, 468], [48, 472], [96, 478], [144, 486], [172, 491],
])
const TERRACE_END = (172 - 282) * PX

const PATH: readonly (readonly [number, number, number])[] = [
    [505, 296, 1], [515, 296, 3], [530, 297, 5], [550, 299, 10], [575, 293, 15], [600, 281, 20],
    [650, 252, 38], [700, 235, 55], [750, 215, 85], [800, 190, 115], [900, 140, 165], [1002, 90, 215],
].map(([y, x, h]) => [y * PX, (x - 282) * PX, h * PX] as const)
const PATH_V0 = 505 * PX

const HEROES: readonly (readonly [number, number, number, number, number, number])[] = [
    [6, 571, 11, 45, 0, 0], [47, 571, 11, 45, 6, 0], [94, 564, 12, 45, -4, 0], [192, 566, 10, 45, 0, 0],
    [252, 570, 10, 45, 5, 0], [167, 577, 12, 45, 0, 0], [132, 596, 14, 40, 5, 0], [154, 591, 15, 45, -3, 0],
    [434, 567, 20, 45, 0, 0], [489, 568, 24, 45, 10, 0], [376, 576, 18, 45, -6, 0], [401, 584, 22, 45, 5, 0],
    [361, 596, 30, 40, 0, 0], [67, 611, 34, 45, 8, 0], [305, 613, 24, 40, -10, 0], [329, 626, 20, 40, 10, 0],
    [482, 623, 55, 35, 10, 0], [435, 635, 30, 40, -5, 0], [6, 644, 28, 40, -5, 0], [120, 646, 22, 45, 10, 0],
    [288, 649, 27, 35, -5, 0], [410, 655, 32, 35, 0, 0], [345, 658, 28, 35, 10, 0], [560, 668, 48, 30, 20, 0],
    [423, 674, 45, 30, -5, 0], [62, 697, 24, 45, 5, 0], [20, 699, 22, 40, -10, 0], [269, 713, 28, 35, -20, 0],
    [396, 718, 30, 40, 10, 0], [326, 727, 28, 30, -10, 0], [471, 765, 85, 40, -8, 1], [406, 888, 70, 25, 5, 2],
    [222, 964, 120, 12, -3, 5], [540, 975, 55, 15, 10, 4], [369, 999, 85, 12, 4, 5],
]

const FIELD_GX = 36
const FIELD_GY = 32
const FIELD_Y0 = 496 * PX
const FIELD_Y1 = 1002 * PX
const FIELD_DATA = "RSkbDAYHCGK70s/q6+3OrZSIiIZ3d3ZwgYmHpK+81eHb6Pvz/////v/26vzx8fL8//7///z9u77//v3++vz++/n29e/s2eTg/+Py/vnf+vv38/304uz/9efYW3Hn8vrf4rH59vvum+jivLW49ff61/j/r6/5xNWi56+j1vnYOQYhT6vg276E1+Gjif/UQWM6AOjcyNLK6NaqwIjAfFm97qyZWgAAKP0AAFoAAADqAAAALeGIDEWvsP//xbz2AABRh4VLAHgFAAADFQAAAAAAK9EAAAAADB4dQXEAAAAAman/dgpJCydUJAAAAABBAAAAAAAKLgAAAAAAAAN2MnLPAAAATh+NLwBxIgUVAwAAAAAAAOj9xgARAAAAAAAAAAA0AAAAKRVzywAAAAAJEAAAAAAAAAAAAK5eDAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQwAAAAAAAAAAAAAAAAAAAAAE6IYAAAAAAAAAAAAAvQAOAAAAAAAAAABgUwAAAAAAAAAAAAAASxUDGAAAAAAAAAAAfAAaAAAAAAAAAABLDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAr5oKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALYHAAAAAIoWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABOjDgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVBNQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4wDcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAog0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC5AAAA"

const FIELD_ROWS = [
    0.6, 0.95, 0.88, 0.78, 0.72, 0.6, 0.55, 0.53, 0.48, 0.44, 0.38, 0.3, 0.25, 0.24, 0.3, 0.31, 0.27, 0.24,
    0.2, 0.18, 0.2, 0.26, 0.34, 0.4, 0.41, 0.4, 0.38, 0.38, 0.45, 0.5, 0.5, 0.5,
]
let fieldGrid: Uint8Array | null = null

function fieldCover(u: number, v: number) {
    if (!fieldGrid) {
        const bin = atob(FIELD_DATA)
        fieldGrid = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) fieldGrid[i] = bin.charCodeAt(i)
    }
    const j = clamp(Math.floor(((v - FIELD_Y0) / (FIELD_Y1 - FIELD_Y0)) * FIELD_GY), 0, FIELD_GY - 1)
    const outside = FIELD_ROWS[j]
    const inside = 1 - smooth(REF_U - 0.03, REF_U, Math.abs(u))
    if (inside <= 0) return outside
    const i = clamp(Math.floor(((u + REF_U) / (2 * REF_U)) * FIELD_GX), 0, FIELD_GX - 1)
    return (fieldGrid[j * FIELD_GX + i] / 255) * inside + outside * (1 - inside)
}

const FIGURE = W_([
    [296, 510], [298.5, 513], [299, 517], [301, 521], [303, 532], [304, 546], [288, 546], [289.5, 532],
    [291.5, 521], [293.5, 517], [294, 513],
])

const MW_A = [-0.072, 0]
const MW_D = [0.316, 0.949]
const MW_N = [0.949, -0.316]
const MW_END = 0.36

const SKY_GW = 30
const SKY_GH = 26
const SKY_V1 = 0.52
const SKY_DATA = "AggqAQsxAgw2AhI/AhVHARhJARtTASFhASx4ASt0ARVCAhA3AhI6AhhEAh5ZASNpASZuAyJmAR9eARtTARlLAhZGAhNDAhA+AQ88Ag87Ag42AQsyAgktAQkqAgw0AQ87AxA/AxZDAhpMARtQAR9bASNoASx8AjODAiRgAhdFAhU+AhVAARZEAhpJAR9YAiFjASBiAR9aARtUARlLARdIARZEARJCARI/AhA8Ag85AgszAQkvAg88ARM+ARRDARlJARtQAR5XASJeASVpASx5ATKHAjSCAjF2ARtJARVAAhQ9AhdBARlHAR9WASBaACBZAR5XARxQARtMARlKARdHARRCARNAARE+AhA9AQ44AhI/AhRCARdKARtSAR9VAiFaAyNhAiZrAShtAShoAilqASNdABlFARtKARpHARhDARpIAhtNAx9UASBZASBYAh1VAh1TARtOARtMAhlKARhKARhIAhVEAhE8AhZEARhKAhxPAh1TASBTAiFbASNjACdpACRiACNbASVfASFXAixrATF3AR9UAh5QARxQAR5RASBTASBXACBZASBWACBXAR9TARxTARxTAhtPARxLARlHARVBAhlMAhtSAxxTASBSACFTACNfAiVlACZqAShpAS51AjePAUOiAlvKAjmLAiJYASJVASBSACBSAiFUACBYACBbASBbASBZASBZARxVAR5WAh1TARxRARtNARlIAhtQAR5VAiNgASNfASNhAiZlASluASt3ATCDATeRAkGpAVDEAVnNAjN/ASNXASRfASNdASNcAiNdASJiAiJkASFjAiJhAiFiASFiAR9gAiBbASBXACBSARxQAS+EATKOATafATecATGLASx7AS13ATCFATWRATiUATqXAUGhAUSgAS9zAS1tASxtASloASZoAidpAShsAShrASdqAiZrASZtACRrACRpACRoAiJkAR9fAR9ZADKOATORATOWATmgAT+pAUCpAjyeATeSAjeOATaJAjOCATN6AS9wAkaYAkOaAjB8AS51AS52Ai97ATGAAjB9Ai95AS17AC54ASt1ASlyAyduACVtACRsASJkACh7ASl7ASl9ASyCAC+JATSUATqgAj+nATydATqXAzyWAT6XAUCaAWDNAVC3AkqyAkCkATmTATuXAj+gAj+jATygATaXATKNAS+CAS1+ASx7ACt5ASZzAiRtACNxASVzASV0ASd7ACyBAS2FATCLATaVATygAT+nAkOtAUq1AU62AVbAAlK2BFnMAku+AT2YAUmuAU24Ak6/AEq5AESvATqdATSPATGLAS+DAC1/ASx5AilzASRxAShzASh3ASmAASqEACyDACx/AS2FATGNATaVAT2lAUeyAUqvAlKyAlGsAlK2Akm3AT6TAUyrAU+3Ak+8AUasAUSoAkGmATudATaSATWOATOMAS6EAi17Aip7ASp8ASuBASyEASuEAC2CAC18AC18ATCEATOOATmaAUKqAUqwAVS5A27bA1zBA0ipATuPAk6nAVCtAUKYATiKAT2YA0GlBECjAjyfATmXATeTATOOAS+DAjGNATOOATOOATKNATKKATGJATCIATKIATSNATmYAUGnAUauAUy0AVrJAWvdAlu8BFi+Az+cAUyjAk+nATuLATuNAUWkAUapAkSmAUGlAj2jAjueADiVATSMAjeXAj2gAT2hATyiATykAT2kAT+nAUOrAEatAkiwAUuzAUu4AU6+AVnLAXLjAojwA2jKA0emAj+WATeKATiLAUKaAk2uAU+2AUuxAUauAUOqAUCnATyhATmUAjqcAj2gAT6mAj+sAUOyAUi5AUy9AU3CAU7GAlDGAVHFAVLGAVPKAlvUAXjuC6T7HrD4BWvGAUamAUKbAUGaAUSeAU2sAlK7AVLBAU6+AUq3AUewAUOsAkCgAjueAj2gAkCtAkKzAkW6AUrDAkrBAUa5AUS2AUO2AUa5Akm+AU/JAVvUAXDpAYbvA4jlBnTQAUioAk2zAVvAAV7EAV3GAVrMAVfJAFTHAVDDAU24AUu0AkesAjyfAj2gAkKyAkS2AkW6AUrDAkW4AkCvAkCsAT+qAT+oAUCpAUOwAU/FAWTeAXftAXLgAWHJAVS/AVPCAVnEAWXUAWTZAWDWAVzRAVfPAFPFAVDCAk++A0u2AjygAj2gAkO1AkS4AkW6AUrDAkOzAkCvAkSyAUe3AUSxAkWvAk6/AU29AmHYAnHuAWjiAVfNAU6/AUq6AUu6AEy9AUu8AUq6AUi3AUi3AUq7AVC+AlPBA0u1AjygAj2gAkS3AkW5AkW6AUrDAkKxAkCvAka0AUe3AUSxAkWvAk6/AU29AmDWAnHuAV/XAVXMAVHEAU2+AUy8AUy8AVPHAlrPAlrNAlrLA1rNA1XIAlTEA0u1Aj2gAj2gAkS4AkW6AkW6AUrDAkGwAkCvAUe2AUe3AUSxAkWvAk6/AU29Al/WAnHuAVrSAVXMAVHEA13OBGzfBGraA1jPAl/XBWreBGLVA1rNA1XIAlXGA0u1Aj2gAj2gAkW5AkW6AkW6AUrDAkGvAkCvAUe2AUe3AUSxAkWvAk6/AU29Al/WAnHuAVfPAVXMAVHEA2XXBGzfBGraA1jPAl/XBWreBWbZA1rNA1XIA1XHA0u1Aj2gAj2gAkW5AkW6AkW6AUrDAkGvAkCvAUe3AUe3AUSxAkWvAk6/AU29Al/VAnHuAVbOAVXMAVHEBGjbBGzfBGraA1jPAl/XBWreBWjbA1rNA1XIA1XHA0u1Aj2gAj2gAkW6AkW6AkW6AUrDAkCvAkCvAUe3AUe3AUSxAkWvAk6/AU29Al/VAnHuAVbNAVXMAVHEBGrdBGzfBGraA1jPAl/XBWreBWndA1rNA1XIA1XHA0u1Aj2gAj2gAkW6AkW6AkW6AUrDAkCvAkCvAUe3AUe3AUSxAkWvAk6/AU29Al/VAnHuAVXNAVXMAVHEBGveBGzfBGraA1jPAl/XBWreBWndA1rNA1XIA1XIA0u1Aj2gAj2gAkW6AkW6AkW6AUrDAkCvAkCvAUe3AUe3AUSxAkWvAk6/AU29Al/VAnHuAVXMAVXMAVHEBGzeBGzfBGraA1jPAl/XBWreBWrdA1rNA1XIA1XIA0u1"

type RGBA = [number, number, number, number]
const WHITE: RGBA = [255, 255, 255, 1]
const TAU = Math.PI * 2
const DEG = Math.PI / 180
const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x)
const smooth = (a: number, b: number, x: number) => {
    const t = clamp((x - a) / (b - a))
    return t * t * (3 - 2 * t)
}

function parseColor(c: unknown, fb: RGBA): RGBA {
    if (typeof c !== "string") return fb
    const s = c.trim()
    if (s[0] === "#") {
        let h = s.slice(1)
        if (h.length === 3 || h.length === 4)
            h = h
                .split("")
                .map((ch) => ch + ch)
                .join("")
        if (h.length !== 6 && h.length !== 8) return fb
        const n = parseInt(h.slice(0, 6), 16)
        if (isNaN(n)) return fb
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255, h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1]
    }
    const m = s.match(/rgba?\(([^)]+)\)/i)
    if (m) {
        const p = m[1]
            .split(/[\s,\/]+/)
            .filter(Boolean)
            .map(parseFloat)
        if (p.length >= 3) return [p[0], p[1], p[2], p.length > 3 && !isNaN(p[3]) ? p[3] : 1]
    }
    return fb
}
const mix = (a: RGBA, b: RGBA, k: number): RGBA => [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
    a[3] + (b[3] - a[3]) * k,
]
const rgba = (c: RGBA, a = 1) =>
    `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${clamp(c[3] * a).toFixed(3)})`

function rng(seed: number) {
    let a = Math.imul(seed | 0, 2654435761) >>> 0 || 1
    return () => {
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}
function hash(x: number, y: number, s: number) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    h ^= h >>> 16
    return (h >>> 0) / 4294967295
}

function pvnoise(x: number, y: number, s: number, px: number) {
    const xi = Math.floor(x),
        yi = Math.floor(y)
    const xf = x - xi,
        yf = y - yi
    const u = xf * xf * (3 - 2 * xf),
        w = yf * yf * (3 - 2 * yf)
    const x0 = ((xi % px) + px) % px,
        x1 = (x0 + 1) % px
    const a = hash(x0, yi, s),
        b = hash(x1, yi, s),
        c = hash(x0, yi + 1, s),
        d = hash(x1, yi + 1, s)
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w
}

function pfbm(x: number, y: number, s: number, o: number, px: number) {
    let sum = 0,
        amp = 0.5,
        f = 1,
        tot = 0
    for (let i = 0; i < o; i++) {
        sum += amp * pvnoise(x * f, y * f, s + i * 17, px * f)
        tot += amp
        amp *= 0.5
        f *= 2
    }
    return sum / tot
}

function lerpTab(tab: readonly (readonly number[])[], x: number, j: number, extrap = false) {
    const n = tab.length
    let i = 1
    if (x <= tab[0][0]) {
        if (!extrap) return tab[0][j]
    } else if (x >= tab[n - 1][0]) {
        if (!extrap) return tab[n - 1][j]
        i = n - 1
    } else while (tab[i][0] < x) i++
    const a = tab[i - 1],
        b = tab[i]
    return a[j] + ((b[j] - a[j]) * (x - a[0])) / (b[0] - a[0])
}

function crTab(tab: readonly (readonly number[])[], x: number, j: number, extrap = false) {
    const n = tab.length
    if (x <= tab[0][0] || x >= tab[n - 1][0]) return lerpTab(tab, x, j, extrap)
    let i = 1
    while (tab[i][0] < x) i++
    const p1 = tab[i - 1],
        p2 = tab[i]
    const p0 = tab[Math.max(0, i - 2)],
        p3 = tab[Math.min(n - 1, i + 1)]
    const t = (x - p1[0]) / (p2[0] - p1[0])
    const t2 = t * t,
        t3 = t2 * t
    return (
        0.5 *
        (2 * p1[j] +
            (-p0[j] + p2[j]) * t +
            (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
            (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)
    )
}
const edgeAt = (u: number) => crTab(EDGE, u, 1)
const terraceAt = (u: number) => crTab(TERRACE, u, 1)
function pathAt(v: number, out: { c: number; h: number }) {
    out.c = crTab(PATH, v, 1, true)

    out.h = Math.max(0, crTab(PATH, v, 2, true) * (1 + 0.12 * Math.sin(v * 95) + 0.07 * Math.sin(v * 260 + 1.3)))
    return out
}
const PATH_TMP = { c: 0, h: 0 }
function inPath(u: number, v: number, dy: number, m: number) {
    const vv = v - dy
    if (vv < PATH_V0) return false
    pathAt(vv, PATH_TMP)
    return Math.abs(u - PATH_TMP.c) < PATH_TMP.h + m
}

/*
 * Open landscape: a long, almost level horizon with a slow roll, and a flower
 * cover that keeps the pass's depth profile (FIELD_ROWS) but breaks it into
 * drifts instead of the baked centre map, which is empty where the path was.
 */
const openEdgeAt = (u: number) =>
    0.5 + 0.0035 * Math.sin(u * 2.3 + 0.7) + 0.002 * Math.sin(u * 5.9 + 2.1) + 0.0012 * Math.sin(u * 13.7 + 0.4)
const OPEN_EDGE_MIN = 0.493
function openCover(u: number, v: number) {
    const j = clamp(Math.floor(((v - FIELD_Y0) / (FIELD_Y1 - FIELD_Y0)) * FIELD_GY), 0, FIELD_GY - 1)
    const drift = pfbm(u * 2.6 + 17.3, v * 9 + 4.1, 53, 3, 4096)
    return clamp(FIELD_ROWS[j] * (0.45 + 1.1 * drift), 0.06, 0.93)
}

function makeCanvas(w: number, h: number) {
    const c = document.createElement("canvas")
    c.width = Math.max(1, Math.ceil(w))
    c.height = Math.max(1, Math.ceil(h))
    return c
}
const ctx2d = (c: HTMLCanvasElement) => c.getContext("2d") as CanvasRenderingContext2D

let skyGrid: Float32Array | null = null
let skyRowBase: Float32Array | null = null
function skyData() {
    if (skyGrid && skyRowBase) return { grid: skyGrid, rows: skyRowBase }
    const bin = atob(SKY_DATA)
    const g = new Float32Array(bin.length)
    for (let i = 0; i < bin.length; i++) g[i] = bin.charCodeAt(i)

    const rows = new Float32Array(SKY_GH * 3)
    const tmp: number[] = []
    for (let j = 0; j < SKY_GH; j++)
        for (let c = 0; c < 3; c++) {
            tmp.length = 0
            for (let i = 0; i < SKY_GW; i++) tmp.push(g[(j * SKY_GW + i) * 3 + c])
            tmp.sort((a, b) => a - b)
            rows[j * 3 + c] = tmp[SKY_GW >> 1]
        }
    skyGrid = g
    skyRowBase = rows
    return { grid: g, rows }
}
function cr1(p0: number, p1: number, p2: number, p3: number, t: number) {
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
}

function sampleSky(u: number, v: number, out: Float32Array) {
    const { grid, rows } = skyData()
    const gx = ((u + REF_U) / (2 * REF_U)) * SKY_GW - 0.5
    const gy = (v / SKY_V1) * SKY_GH - 0.5
    const ix = Math.floor(gx),
        iy = Math.floor(gy)
    const tx = gx - ix,
        ty = gy - iy
    const ex = Math.max(0, -REF_U - u, u - REF_U),
        ey = Math.max(0, -v)
    const fade = 1 - smooth(0, 0.07, Math.sqrt(ex * ex + ey * ey))
    const ry = clamp(gy, 0, SKY_GH - 1)
    const r0 = Math.floor(ry),
        r1 = Math.min(SKY_GH - 1, r0 + 1),
        rf = ry - r0
    for (let c = 0; c < 3; c++) {
        const base = rows[r0 * 3 + c] + (rows[r1 * 3 + c] - rows[r0 * 3 + c]) * rf
        let val = base
        if (fade > 0) {
            const col = (j: number) => {
                const y = clamp(iy + j, 0, SKY_GH - 1) * SKY_GW
                const at = (i: number) => grid[(y + clamp(ix + i, 0, SKY_GW - 1)) * 3 + c]
                return cr1(at(-1), at(0), at(1), at(2), tx)
            }
            const g = cr1(col(-1), col(0), col(1), col(2), ty)
            val = base + (g - base) * fade
        }
        out[c] = val
    }
}

interface Pose {
    yaw: number
    pitch: number
    open: number
    petals: number
    width: number
    curl: number

    fan: number

    core: number
    jit: number[]
}
interface Palette {
    tip: string
    deep: string
    mid: string
    base: string
    edge: string
}
const PETAL_M = 12
const SHAPE: number[] = (() => {
    const s: number[] = []
    let mx = 0
    for (let i = 0; i <= PETAL_M; i++) {
        const t = i / PETAL_M
        const w = Math.pow(t, 0.7) * Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.6)))
        s.push(w)
        mx = Math.max(mx, w)
    }
    return s.map((w) => w / mx)
})()

const SHAPE_FAN: number[] = (() => {
    const s: number[] = []
    let mx = 0
    for (let i = 0; i <= PETAL_M; i++) {
        const t = i / PETAL_M
        const w = Math.pow(t, 1.2) * Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.2)))
        s.push(w)
        mx = Math.max(mx, w)
    }
    return s.map((w) => w / mx)
})()

function makePose(R: () => number, pitch: number, open: number): Pose {
    const jit: number[] = []
    for (let i = 0; i < 12; i++) jit.push(R() * 2 - 1)
    return { yaw: R() * TAU, pitch, open, petals: 6, width: open < 0.9 ? 0.34 : 0.25, curl: -0.18, fan: 0, core: 1, jit }
}

function paintFlower(g: CanvasRenderingContext2D, R: number, p: Pose, pal: Palette) {
    const cb = Math.cos(p.pitch),
        sb = Math.sin(p.pitch)
    const n = p.petals
    const petals: { d: number; xs: number[]; ys: number[]; tx: number; ty: number; mx: number[]; my: number[] }[] = []
    if (p.fan > 0) {
        for (let i = 0; i < n; i++) {
            const a = -p.fan / 2 + (p.fan * i) / (n - 1) + p.jit[i] * 0.08
            const L = R * (0.62 + 0.38 * Math.cos(a) + 0.06 * p.jit[i + 6])
            const xs: number[] = [],
                ys: number[] = [],
                mx: number[] = [],
                my: number[] = [],
                rx: number[] = [],
                ry: number[] = []
            for (let k = 0; k <= PETAL_M; k++) {
                const sN = k / PETAL_M
                const aa = a * (1 + p.curl * sN)
                const X = Math.sin(aa) * L * sN,
                    Y = -Math.cos(aa) * L * sN

                const hw = p.width * L * SHAPE_FAN[k]
                xs.push(X + Math.cos(aa) * hw)
                ys.push(Y + Math.sin(aa) * hw)
                rx.push(X - Math.cos(aa) * hw)
                ry.push(Y - Math.sin(aa) * hw)
                mx.push(X)
                my.push(Y)
            }
            for (let k = PETAL_M; k >= 0; k--) {
                xs.push(rx[k])
                ys.push(ry[k])
            }
            petals.push({ d: i % 2 ? -R : R - Math.abs(a), xs, ys, tx: mx[PETAL_M], ty: my[PETAL_M], mx, my })
        }
    }
    for (let i = 0; i < (p.fan > 0 ? 0 : n); i++) {
        const phi = p.yaw + (i * TAU) / n + p.jit[i] * 0.18
        const a0 = p.open * (1 + 0.08 * p.jit[i + 6])
        const L = R * (0.92 + 0.12 * p.jit[(i + 3) % 12])
        const cp = Math.cos(phi),
            sp = Math.sin(phi)
        const left: number[] = [],
            right: number[] = [],
            mx: number[] = [],
            my: number[] = []
        let tx = 0,
            ty = 0,
            d = 0
        for (let k = 0; k <= PETAL_M; k++) {
            const s = k / PETAL_M
            const a = a0 + p.curl * s * s
            const x = L * s * Math.sin(a) * cp,
                y = L * s * Math.cos(a),
                z = L * s * Math.sin(a) * sp
            const hw = p.width * L * SHAPE[k]

            const X = x,
                Y = -(y * cb + z * sb)
            const wx = -sp * hw,
                wy = -(cp * hw * sb)
            left.push(X + wx, Y + wy)
            right.push(X - wx, Y - wy)
            mx.push(X)
            my.push(Y)
            if (k === PETAL_M) {
                tx = X
                ty = Y
            }
            if (k === 7) d = -y * sb + z * cb
        }
        const xs: number[] = []
        const ys: number[] = []
        for (let k = 0; k <= PETAL_M; k++) {
            xs.push(left[k * 2])
            ys.push(left[k * 2 + 1])
        }
        for (let k = PETAL_M; k >= 0; k--) {
            xs.push(right[k * 2])
            ys.push(right[k * 2 + 1])
        }
        petals.push({ d, xs, ys, tx, ty, mx, my })
    }
    petals.sort((a, b) => b.d - a.d)
    let coreDone = false
    for (const pt of petals) {
        const front = pt.d < -0.2 * R
        if (front && !coreDone) {
            lightCore(g, R, p.core)
            coreDone = true
        }
        let tx = pt.tx,
            ty = pt.ty
        const tl = Math.hypot(tx, ty)
        if (tl < R * 0.3) {
            const k = (R * 0.3) / Math.max(1e-6, tl)
            tx *= k
            ty *= k
        }
        const gr = g.createLinearGradient(0, 0, tx, ty)
        gr.addColorStop(0, pal.base)
        gr.addColorStop(front ? 0.22 : 0.3, pal.mid)
        gr.addColorStop(0.62, pal.tip)
        gr.addColorStop(1, pal.deep)
        g.globalAlpha = front ? 0.93 : 1
        g.beginPath()
        g.moveTo(pt.xs[0], pt.ys[0])
        for (let k = 1; k < pt.xs.length; k++) g.lineTo(pt.xs[k], pt.ys[k])
        g.closePath()
        g.fillStyle = gr
        g.fill()
        g.globalAlpha = 1
        g.strokeStyle = pal.edge
        g.lineWidth = R * 0.022
        g.stroke()
        if (!front) {
            g.strokeStyle = "rgba(225,248,255,0.5)"
            g.lineWidth = R * 0.03
            g.beginPath()
            g.moveTo(pt.mx[1], pt.my[1])
            for (let k = 2; k <= 6; k++) g.lineTo(pt.mx[k], pt.my[k])
            g.stroke()
        }
    }
    if (!coreDone) lightCore(g, R, p.core)
    lightCore(g, R, 0.45 * p.core)

    g.strokeStyle = `rgba(240,252,255,${0.85 * p.core})`
    g.lineWidth = R * 0.028
    g.lineCap = "round"
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.32 + p.jit[i] * 0.1
        const l = R * (0.2 + 0.08 * p.jit[i + 5])
        g.beginPath()
        g.moveTo(0, 0)
        g.lineTo(Math.cos(a) * l, Math.sin(a) * l * (0.55 + 0.45 * Math.cos(p.pitch)))
        g.stroke()
    }
    const hot = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.13)
    hot.addColorStop(0, `rgba(255,255,255,${p.core})`)
    hot.addColorStop(0.45, `rgba(235,252,255,${0.75 * p.core})`)
    hot.addColorStop(1, "rgba(220,248,255,0)")
    g.fillStyle = hot
    g.beginPath()
    g.arc(0, 0, R * 0.13, 0, TAU)
    g.fill()
}

function lightCore(g: CanvasRenderingContext2D, R: number, k: number) {
    const c = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.62)
    c.addColorStop(0, `rgba(232,252,255,${0.95 * k})`)
    c.addColorStop(0.3, `rgba(130,225,255,${0.55 * k})`)
    c.addColorStop(1, "rgba(80,180,255,0)")
    g.globalCompositeOperation = "source-atop"
    g.fillStyle = c
    g.fillRect(-R * 0.62, -R * 0.62, R * 1.24, R * 1.24)
    g.globalCompositeOperation = "source-over"
}

function makePalette(fl: RGBA): Palette {
    return {
        base: rgba(mix(fl, [175, 246, 255, 1], 0.8)),
        mid: rgba(mix(fl, [60, 200, 255, 1], 0.4)),
        tip: rgba(fl),
        deep: rgba(mix(fl, [5, 30, 120, 1], 0.45)),
        edge: rgba(mix(fl, [0, 14, 80, 1], 0.6), 0.5),
    }
}

interface Sprite {
    c: HTMLCanvasElement
    sx: number
    sy: number
    sw: number
    sh: number

    r: number

    ox: number
    oy: number
}

function packAtlas(list: Sprite[]) {
    const order = list.slice().sort((a, b) => b.sh - a.sh)
    const maxW = 2048
    let x = 0,
        y = 0,
        rowH = 0,
        w = 0
    const pos: number[] = []
    for (const sp of order) {
        if (x + sp.sw > maxW) {
            x = 0
            y += rowH + 1
            rowH = 0
        }
        pos.push(x, y)
        x += sp.sw + 1
        rowH = Math.max(rowH, sp.sh)
        w = Math.max(w, x)
    }
    const atlas = makeCanvas(w, y + rowH)
    const g = ctx2d(atlas)
    order.forEach((sp, i) => {
        g.drawImage(sp.c, sp.sx, sp.sy, sp.sw, sp.sh, pos[i * 2], pos[i * 2 + 1], sp.sw, sp.sh)
        sp.c = atlas
        sp.sx = pos[i * 2]
        sp.sy = pos[i * 2 + 1]
    })
    return atlas
}
const FILTER_OK = (() => {
    if (typeof document === "undefined") return false
    try {
        const g = document.createElement("canvas").getContext("2d")
        return !!g && typeof (g as CanvasRenderingContext2D & { filter?: string }).filter === "string"
    } catch {
        return false
    }
})()

function flowerSprite(r: number, pose: Pose, pal: Palette, blur: number, halo?: { col: RGBA; a: number; size: number }): Sprite {
    const pad = Math.ceil(blur * 2.5 + 2)
    const hr = halo ? r * 1.1 * halo.size : 0
    const w = Math.ceil(Math.max(r * 2.3, hr * 2)) + pad * 2
    const h = Math.ceil(Math.max(r * 1.75, hr * 1.6 + r * 0.2)) + pad * 2
    const c = makeCanvas(w, h)
    const g = ctx2d(c)
    const ox = w / 2,
        oy = pad + Math.max(r * 1.1, hr * 0.8 + r * 0.1)
    g.translate(ox, oy)
    if (halo && halo.a > 0) {
        g.save()
        g.translate(0, -r * 0.1)
        g.scale(1, 0.8)
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, hr)
        gr.addColorStop(0, rgba(halo.col, 0.75 * halo.a))
        gr.addColorStop(0.3, rgba(halo.col, 0.3 * halo.a))
        gr.addColorStop(0.6, rgba(halo.col, 0.08 * halo.a))
        gr.addColorStop(1, rgba(halo.col, 0))
        g.fillStyle = gr
        g.beginPath()
        g.arc(0, 0, hr, 0, TAU)
        g.fill()
        g.restore()
    }
    if (blur > 0.3 && FILTER_OK) g.filter = `blur(${blur.toFixed(2)}px)`
    paintFlower(g, r, pose, pal)
    return { c, sx: 0, sy: 0, sw: w, sh: h, r, ox, oy }
}
function radialSprite(col: RGBA, stops: readonly (readonly [number, number])[]) {
    const R = 64
    const c = makeCanvas(R, R)
    const g = ctx2d(c)
    const gr = g.createRadialGradient(R / 2, R / 2, 0, R / 2, R / 2, R / 2)
    for (const [o, a] of stops) gr.addColorStop(o, rgba(col, a))
    g.fillStyle = gr
    g.fillRect(0, 0, R, R)
    return c
}

interface Box {
    u0: number
    u1: number
    v0: number
    v1: number
}
type Adv = BluebellPassAdvanced

interface Bloom {
    bu: number
    bv: number
    stem: number
    R: number
    lean: number
    pose: number
    hero: number
    blur: number
    z: number
    xn: number
    depth: number
    gph: number
    gper: number
    alpha: number
    bend: number
}

const TILE = 0.25

const SOW_P = 2.3
const SOW_N0 = 60

const HEAD_AREA = 1.07
const SOW_Z0 = 0.012
function sowFlowers(
    box: Box,
    adv: Adv,
    density: number,
    fs: number,
    zLive: number,
    live: Bloom[],
    baked: Bloom[],
    open = false
) {
    const dy = adv.horizonY / 100 - 0.5
    const edge = open ? openEdgeAt : edgeAt
    const n0 = SOW_N0 * (adv.flowerCount / 420) * (density / 70)
    const e = 1 - SOW_P
    const zMax = Math.max(SOW_Z0 * 2, box.v1 - (0.5 + dy) + 0.4)
    for (let ti = Math.floor(box.u0 / TILE); ti * TILE < box.u1; ti++) {
        for (let bz = SOW_Z0, bi = 0; bz < zMax; bz *= 1.4, bi++) {
            const z0 = bz,
                z1 = bz * 1.4
            const R = rng(Math.imul(ti + 7919, 1013) ^ Math.imul(bi + 31, 7777) ^ Math.imul(adv.seed | 0, 104729))
            const want = ((n0 * TILE) / -e) * (Math.pow(z0, e) - Math.pow(z1, e))
            let cnt = Math.floor(want) + (R() < want - Math.floor(want) ? 1 : 0)
            const A = Math.pow(z0, e),
                B = Math.pow(z1, e)
            while (cnt-- > 0) {
                const u = (ti + R()) * TILE
                const z = Math.pow(A + R() * (B - A), 1 / e)
                const r1 = R(),
                    r2 = R(),
                    r3 = R(),
                    r4 = R(),
                    r5 = R(),
                    r6 = R()
                const bv = edge(u) + dy + z
                const Rw = SIZE_PER_DEPTH * z * (0.8 + 0.4 * r1) * fs
                if (u < box.u0 - Rw * 2 || u > box.u1 + Rw * 2) continue
                if (!open && inPath(u, bv, dy, Rw * 0.35)) continue
                const stem = Rw * (0.9 + 0.7 * r2)

                const cover = Math.min(0.93, open ? openCover(u, bv - stem - dy) : fieldCover(u, bv - stem - dy))
                const full = n0 * HEAD_AREA * Rw * Rw * Math.pow(z, -SOW_P)
                if (R() * full > -Math.log(1 - cover)) continue
                const b: Bloom = {
                    bu: u,
                    bv,
                    stem,
                    R: Rw,
                    lean: (r3 - 0.5) * 0.5,
                    pose: (r4 * 8) | 0,
                    hero: -1,
                    blur: smooth(0.4, 0.75, z),
                    z,
                    xn: u / 1.5 + 0.5,
                    depth: clamp(z / 0.55),
                    gph: r5 * TAU,
                    gper: r6 < 0.5 ? 1 : 0.5,
                    alpha: (0.82 + 0.18 * r5) * (0.6 + 0.4 * smooth(0.02, 0.15, z)),
                    bend: r6 - 0.5,
                }
                if (z < zLive) baked.push(b)
                else live.push(b)
            }
        }
    }
    HEROES.forEach(([x, y, r, pitch, lean, blur], i) => {
        const Rw = r * PX * fs * (pitch < 20 ? 1.25 : 1.12)
        const stem = Rw * 2.1
        const cu = (x - 282) * PX
        const cv = y * PX + dy
        const z = cv + stem - (0.5 + dy)
        live.push({
            bu: cu,
            bv: cv + stem,
            stem,
            R: Rw,
            lean: lean * DEG,
            pose: i,
            hero: i,
            blur: blur / Math.max(1, r),
            z,
            xn: cu / 1.5 + 0.5,
            depth: clamp(z / 0.55),
            gph: hash(i, 3, 9) * TAU,
            gper: hash(i, 5, 9) < 0.5 ? 1 : 0.5,
            alpha: 1,
            bend: hash(i, 7, 9) - 0.5,
        })
    })
    live.sort((a, b) => a.bv - b.bv)
}

interface SkyLayers {
    sky: HTMLCanvasElement
    skyBox: Box

    wisps: HTMLCanvasElement
    banks: HTMLCanvasElement
    wispMask: HTMLCanvasElement
    bankMask: HTMLCanvasElement
    cloudTmp: HTMLCanvasElement

    milky: HTMLCanvasElement | null
    milkyEnv: HTMLCanvasElement
    milkyTmp: HTMLCanvasElement
    milkyBloom: HTMLCanvasElement

    mres: number
    mhalf: number
}
interface Layers {
    box: Box
    res: number
    skyL: SkyLayers | null
    ground: HTMLCanvasElement
    groundBox: Box
    carpet: HTMLCanvasElement[]
    carpetBox: Box
}

function skyColorsDefault() {
    return [
        parseColor(DEFAULT_ADVANCED.skyTop, WHITE),
        parseColor(DEFAULT_ADVANCED.skyMid, WHITE),
        parseColor(DEFAULT_ADVANCED.skyHorizon, WHITE),
    ]
}
const SKY_STOPS = [0, 0.25, 0.41]
function grad3(cols: RGBA[], v: number, c: number) {
    if (v <= SKY_STOPS[0]) return cols[0][c]
    if (v >= SKY_STOPS[2]) return cols[2][c]
    const k = v < SKY_STOPS[1] ? 0 : 1
    const f = (v - SKY_STOPS[k]) / (SKY_STOPS[k + 1] - SKY_STOPS[k])
    return cols[k][c] + (cols[k + 1][c] - cols[k][c]) * f
}

const mwFade = (sa: number) =>
    smooth(0.1, 0.2, sa) * (1 - smooth(MW_END - 0.05, MW_END, sa)) * (0.35 + 0.65 * smooth(0.1, 0.3, sa))

function buildSkyLayers(box: Box, res: number, adv: Adv): SkyLayers {
    const dy = adv.horizonY / 100 - 0.5
    const skyBox: Box = { u0: box.u0, u1: box.u1, v0: box.v0, v1: Math.min(box.v1, 0.56 + dy) }
    const rs = res / 4
    const lw = Math.max(2, Math.ceil((skyBox.u1 - skyBox.u0) * rs))
    const lh = Math.max(2, Math.ceil((skyBox.v1 - skyBox.v0) * rs))
    const sky = makeCanvas(lw, lh)
    const wisps = makeCanvas(lw, lh)
    const banks = makeCanvas(lw, lh)
    const wispMask = makeCanvas(lw, lh)
    const bankMask = makeCanvas(lw, lh)
    const si = ctx2d(sky).createImageData(lw, lh)
    const wi = ctx2d(wisps).createImageData(lw, lh)
    const bi = ctx2d(banks).createImageData(lw, lh)
    const wm = ctx2d(wispMask).createImageData(lw, lh)
    const bm = ctx2d(bankMask).createImageData(lw, lh)
    const def = skyColorsDefault()
    const usr = [
        parseColor(adv.skyTop, def[0]),
        parseColor(adv.skyMid, def[1]),
        parseColor(adv.skyHorizon, def[2]),
    ]
    const cc = parseColor(adv.cloudColor, [10, 20, 96, 1])
    const bc = mix(usr[2], WHITE, 0.12)
    const co = adv.cloudOpacity / 100
    const sd = adv.seed | 0
    const s3 = new Float32Array(3)

    const Pu = skyBox.u1 - skyBox.u0
    const nW = Math.max(1, Math.round(9 * Pu)),
        nB = Math.max(1, Math.round(2.6 * Pu)),
        nL = Math.max(1, Math.round(3.2 * Pu))
    const put = (d: ImageData, k: number, col: RGBA, a: number) => {
        d.data[k] = col[0]
        d.data[k + 1] = col[1]
        d.data[k + 2] = col[2]
        d.data[k + 3] = clamp(a) * 255
    }
    for (let j = 0; j < lh; j++) {
        const v = skyBox.v0 + (j + 0.5) / rs
        const alpha = 0.55 + 0.45 * smooth(0, 0.12, v)
        const gd = [grad3(def, v, 0), grad3(def, v, 1), grad3(def, v, 2)]
        const lumD = 0.2 * gd[0] + 0.7 * gd[1] + 0.1 * gd[2] + 1
        const delta = [grad3(usr, v, 0) - gd[0], grad3(usr, v, 1) - gd[1], grad3(usr, v, 2) - gd[2]]
        const low = 1 - smooth(0.4 + dy, 0.5 + dy, v)
        for (let i = 0; i < lw; i++) {
            const u = skyBox.u0 + (i + 0.5) / rs
            const x01 = (i + 0.5) / lw
            sampleSky(u, v, s3)
            const L = clamp((0.2 * s3[0] + 0.7 * s3[1] + 0.1 * s3[2] + 1) / lumD, 0, 3)
            const k = (j * lw + i) * 4
            si.data[k] = clamp((s3[0] + delta[0] * L) / alpha, 0, 255)
            si.data[k + 1] = clamp((s3[1] + delta[1] * L) / alpha, 0, 255)
            si.data[k + 2] = clamp((s3[2] + delta[2] * L) / alpha, 0, 255)
            si.data[k + 3] = alpha * 255

            const wisp = pfbm(x01 * nW, v * 24, sd + 5, 4, nW) - 0.5
            const bank = smooth(0.5, 0.7, pfbm(x01 * nB, v * 6.5, sd + 9, 5, nB))
            const lift = smooth(0.52, 0.72, pfbm(x01 * nL, v * 8, sd + 23, 4, nL))
            const wn = (Math.max(0, wisp) * 0.9 * 0.6 - Math.max(0, -wisp) * 1.3) * co * low
            const bn = (lift * 0.45 * 0.6 - bank * 0.75) * co * low
            put(wi, k, wn > 0 ? bc : cc, Math.abs(wn))
            put(bi, k, bn > 0 ? bc : cc, Math.abs(bn))
            const ex = Math.max(0, -REF_U - u, u - REF_U)
            const out = smooth(0, 0.12, Math.max(ex, -v))
            put(wm, k, WHITE, 0.3 + 0.7 * out)
            put(bm, k, WHITE, out)
        }
    }
    ctx2d(sky).putImageData(si, 0, 0)
    ctx2d(wisps).putImageData(wi, 0, 0)
    ctx2d(banks).putImageData(bi, 0, 0)
    ctx2d(wispMask).putImageData(wm, 0, 0)
    ctx2d(bankMask).putImageData(bm, 0, 0)

    const w = Math.max(0.005, adv.milkyWidth / 100)
    const mres = res / 2
    const mhalf = w * 3.4
    const mw = Math.max(2, Math.ceil(MW_END * mres))
    const mh = Math.max(2, Math.ceil(2 * mhalf * mres))
    const milkyEnv = makeCanvas(mw, 1)
    {
        const e = ctx2d(milkyEnv).createImageData(mw, 1)
        for (let i = 0; i < mw; i++) put(e, i * 4, WHITE, mwFade((i + 0.5) / mres))
        ctx2d(milkyEnv).putImageData(e, 0, 0)
    }
    let milky: HTMLCanvasElement | null = null
    if (adv.milkyOpacity > 0) {
        milky = makeCanvas(mw, mh)
        const mi = ctx2d(milky).createImageData(mw, mh)
        const mc = parseColor(adv.milkyColor, [185, 208, 255, 1])
        const outer = mix([60, 140, 240, 1], mc, 0.3)
        const mo = adv.milkyOpacity / 100
        const nT = Math.max(1, Math.round(40 * MW_END)),
            nLn = Math.max(1, Math.round(18 * MW_END))
        for (let j = 0; j < mh; j++) {
            const d = -mhalf + (j + 0.5) / mres
            const band = Math.exp(-0.5 * (d / w) * (d / w))
            const core = Math.exp(-0.5 * (d / (w * 0.45)) * (d / (w * 0.45)))
            for (let i = 0; i < mw; i++) {
                const x01 = (i + 0.5) / mw
                const tex = smooth(0.35, 0.8, pfbm(x01 * nT, d * 60, sd, 5, nT))
                const lane = smooth(0.5, 0.68, pfbm(x01 * nLn, d * 34 + 2.2, sd + 11, 4, nLn)) * 0.8
                let m = (band * 0.55 * tex + core * 0.5 * tex) * (1 - lane * band)
                let col = mix(outer, mc, clamp(core * (0.4 + 0.8 * tex)))
                if (hash(i, j, sd + 99) > 0.985 && band > 0.3) {
                    m += 0.4 * band
                    col = mix(col, WHITE, 0.7)
                }
                put(mi, (j * mw + i) * 4, col, clamp(m) * mo)
            }
        }
        ctx2d(milky).putImageData(mi, 0, 0)
    }
    return {
        sky,
        skyBox,
        wisps,
        banks,
        wispMask,
        bankMask,
        cloudTmp: makeCanvas(lw, lh),
        milky,
        milkyEnv,
        milkyTmp: makeCanvas(mw, mh),
        milkyBloom: makeCanvas(Math.max(2, Math.ceil(mw / 8)), Math.max(2, Math.ceil(mh / 8))),
        mres,
        mhalf,
    }
}

const STAR_TINTS: RGBA[] = [
    [205, 222, 255, 1],
    [238, 244, 255, 1],
    [190, 232, 255, 1],
    [255, 236, 214, 1],
]
const STAR_TYPES = [
    { core: 0.6, halo: 1.3, ha: 0.1, spike: 0 },
    { core: 0.75, halo: 2.2, ha: 0.2, spike: 0 },
    { core: 0.9, halo: 3.4, ha: 0.28, spike: 9 },
    { core: 1.1, halo: 5.5, ha: 0.32, spike: 20 },
]
function starSprites(k: number): Sprite[] {
    const out: Sprite[] = []
    for (const t of STAR_TYPES)
        for (const tint of STAR_TINTS) {
            const ext = Math.max(t.spike, t.halo * 3) * k + 2
            const sz = Math.ceil(ext * 2)
            const c = makeCanvas(sz, sz)
            const g = ctx2d(c)
            const o = sz / 2
            const radial = (r: number, stops: [number, number][]) => {
                const gr = g.createRadialGradient(o, o, 0, o, o, r)
                for (const [at, a] of stops) gr.addColorStop(at, rgba(tint, a))
                g.fillStyle = gr
                g.fillRect(o - r, o - r, r * 2, r * 2)
            }
            g.globalCompositeOperation = "lighter"
            radial(t.halo * 3 * k, [
                [0, t.ha],
                [0.3, t.ha * 0.35],
                [1, 0],
            ])
            if (t.spike) {
                const sw = Math.max(0.7, 0.75 * k)
                for (const [ang, len, a] of [
                    [0, 1, 0.55],
                    [Math.PI / 2, 1, 0.55],
                    [Math.PI / 4, 0.38, 0.2],
                    [-Math.PI / 4, 0.38, 0.2],
                ] as const) {
                    const L = t.spike * k * len
                    g.save()
                    g.translate(o, o)
                    g.rotate(ang)
                    const gr = g.createLinearGradient(-L, 0, L, 0)
                    gr.addColorStop(0, rgba(tint, 0))
                    gr.addColorStop(0.5, rgba(tint, a))
                    gr.addColorStop(1, rgba(tint, 0))
                    g.fillStyle = gr
                    g.fillRect(-L, -sw / 2, L * 2, sw)
                    g.restore()
                }
            }
            radial(t.core * 3 * k, [
                [0, 1],
                [0.3, 0.75],
                [1, 0],
            ])
            out.push({ c, sx: 0, sy: 0, sw: sz, sh: sz, r: 1, ox: o, oy: o })
        }
    packAtlas(out)
    return out
}

function buildGround(
    box: Box,
    res: number,
    adv: Adv,
    fl: RGBA,
    baked: Bloom[],
    sprites: Sprite[],
    glowSpr: HTMLCanvasElement,
    glowK: number,
    fs: number,
    open = false
) {
    const dy = adv.horizonY / 100 - 0.5
    const edge = open ? openEdgeAt : edgeAt

    let top = open ? OPEN_EDGE_MIN : 1
    if (!open)
        for (const r of [LEFT_RIDGE, RIGHT_RIDGE])
            for (let i = 0; i < r.length - 1; i++)
                if (r[i + 1][0] >= box.u0 && r[i][0] <= box.u1) top = Math.min(top, r[i][1], r[i + 1][1])
    const gBox: Box = { u0: box.u0, u1: box.u1, v0: Math.max(box.v0, top + dy - 0.01), v1: box.v1 }
    if (gBox.v1 <= gBox.v0) gBox.v1 = gBox.v0 + 0.01
    let r = res
    const area = (gBox.u1 - gBox.u0) * (gBox.v1 - gBox.v0) * r * r
    if (area > 9e6) r *= Math.sqrt(9e6 / area)
    const c = makeCanvas((gBox.u1 - gBox.u0) * r, (gBox.v1 - gBox.v0) * r)
    const g = ctx2d(c)
    g.setTransform(r, 0, 0, r, -gBox.u0 * r, -gBox.v0 * r)
    const px = 1 / r
    const R = rng(adv.seed * 13 + 1)
    const skyHor = parseColor(adv.skyHorizon, [2, 82, 196, 1])
    const haze = parseColor(adv.hazeColor, [111, 143, 255, 1])

    // The pass's backdrop: far range and peaks, mist, both ridges.
    if (!open) {
    const pS = parseColor(adv.peakShadow, [6, 34, 124, 1])
    const pL = parseColor(adv.peakLight, [175, 198, 245, 1])
    const farPath = () => {
        g.beginPath()
        FAR_RANGE.forEach(([u, v], i) => (i ? g.lineTo(u, v + dy) : g.moveTo(u, v + dy)))
        g.lineTo(FAR_RANGE[FAR_RANGE.length - 1][0], 0.52 + dy)
        g.lineTo(FAR_RANGE[0][0], 0.52 + dy)
        g.closePath()
    }
    farPath()
    const fg = g.createLinearGradient(0, 0.365 + dy, 0, 0.48 + dy)
    fg.addColorStop(0, rgba(pS))
    fg.addColorStop(0.45, rgba(mix(pS, [1, 20, 86, 1], 0.7)))
    fg.addColorStop(1, rgba(mix(pS, [1, 14, 58, 1], 0.9)))
    g.fillStyle = fg
    g.fill()
    g.save()
    farPath()
    g.clip()
    const lit = mix(pS, pL, 0.18)
    g.lineCap = "round"
    for (const [ai, fw, ns] of FAR_PEAKS) {
        const [au, av0] = FAR_RANGE[ai]
        const av = av0 + dy

        const [lu, lv] = FAR_RANGE[ai - 1],
            [ru, rv] = FAR_RANGE[ai + 1]
        const ll = Math.hypot(lu - au, lv - av0),
            rl = Math.hypot(ru - au, rv - av0)
        const dl = [(lu - au) / ll, (lv - av0) / ll],
            dr = [(ru - au) / rl, (rv - av0) / rl]

        const sg = g.createLinearGradient(au, av, au + dr[0] * fw + fw * 0.3, av + dr[1] * fw + fw * 1.2)
        sg.addColorStop(0, "rgba(0,8,40,0.55)")
        sg.addColorStop(1, "rgba(0,8,40,0)")
        g.fillStyle = sg
        g.beginPath()
        g.moveTo(au, av)
        g.lineTo(au + dr[0] * fw * 1.6, av + dr[1] * fw * 1.6)
        g.lineTo(au + dr[0] * fw * 0.5 + fw * 0.1, av + fw * 2.2)
        g.lineTo(au - fw * 0.05, av + fw * 1.4)
        g.closePath()
        g.fill()

        const lg = g.createLinearGradient(au + dl[0] * fw * 0.3, av + dl[1] * fw * 0.3, au + fw * 0.25, av + fw * 0.9)
        lg.addColorStop(0, rgba(lit, 0.6))
        lg.addColorStop(1, rgba(lit, 0))
        g.fillStyle = lg
        g.beginPath()
        g.moveTo(au, av)
        g.lineTo(au + dl[0] * fw * 1.4, av + dl[1] * fw * 1.4)
        g.lineTo(au + dl[0] * fw * 0.6 + fw * 0.3, av + dl[1] * fw * 0.6 + fw * 1.4)
        g.lineTo(au + fw * 0.12, av + fw * 0.9)
        g.closePath()
        g.fill()

        for (let k = 0; k < ns * 3; k++) {
            const left = k % 5 < 3
            const d = left ? dl : dr
            const along = Math.pow(R(), 0.8) * fw * 1.3
            const inset = (0.002 + R() * 0.016) * (fw / 0.05 + 0.3)
            const su = au + d[0] * along + (left ? 1 : -1) * inset * 0.35,
                sv = av + d[1] * along + inset
            const turn = (left ? -1 : 1) * (0.15 + R() * 0.3)
            const c = Math.cos(turn),
                sn = Math.sin(turn)
            const ex = d[0] * c - d[1] * sn,
                ey = d[0] * sn + d[1] * c
            const len = (0.005 + 0.02 * R()) * (fw / 0.05 + 0.35)
            g.strokeStyle = rgba(pL, (left ? 0.35 : 0.22) + 0.4 * R())
            g.lineWidth = px * (0.45 + 0.6 * R())
            g.beginPath()
            g.moveTo(su, sv)
            g.quadraticCurveTo(su + ex * len * 0.5, sv + ey * len * 0.5 + 0.0015, su + ex * len, sv + ey * len + 0.003)
            g.stroke()
        }
    }
    g.restore()
    g.beginPath()
    FAR_RANGE.forEach(([u, v], i) => (i ? g.lineTo(u, v + dy) : g.moveTo(u, v + dy)))
    g.strokeStyle = rgba(mix(skyHor, WHITE, 0.35), 0.55)
    g.lineWidth = px * 1.1
    g.stroke()

    const mist = g.createLinearGradient(-0.04, 0, 0.034, 0)
    mist.addColorStop(0, rgba(haze, 0))
    mist.addColorStop(0.5, rgba(mix(haze, WHITE, 0.2), 0.45))
    mist.addColorStop(1, rgba(haze, 0))
    g.fillStyle = mist
    g.fillRect(-0.045, 0.4745 + dy, 0.08, px * 2.2)

    const mCol = parseColor(adv.mountainColor, [0, 4, 26, 1])
    const rim = parseColor(adv.rimColor, [30, 42, 112, 1])
    for (const ridge of [LEFT_RIDGE, RIGHT_RIDGE]) {
        g.beginPath()
        ridge.forEach(([u, v], i) => (i ? g.lineTo(u, v + dy) : g.moveTo(u, v + dy)))
        g.lineTo(ridge[ridge.length - 1][0], 0.62 + dy)
        g.lineTo(ridge[0][0], 0.62 + dy)
        g.closePath()
        const mg = g.createLinearGradient(0, 0.28 + dy, 0, 0.5 + dy)
        mg.addColorStop(0, rgba(mCol))
        mg.addColorStop(0.75, rgba(mix(mCol, [0, 10, 40, 1], 0.9)))
        mg.addColorStop(1, rgba(mix(mCol, [1, 16, 58, 1], 0.9)))
        g.fillStyle = mg
        g.fill()
        g.save()
        g.beginPath()
        ridge.forEach(([u, v], i) => (i ? g.lineTo(u, v + dy) : g.moveTo(u, v + dy)))
        g.strokeStyle = rgba(rim, 0.5)
        g.lineWidth = px
        g.stroke()
        g.restore()
    }

    {
        const gg = g.createRadialGradient(0.27, 0.49 + dy, 0, 0.27, 0.49 + dy, 0.14)
        gg.addColorStop(0, "rgba(4,34,40,0.8)")
        gg.addColorStop(1, "rgba(4,34,40,0)")
        g.fillStyle = gg
        g.beginPath()
        RIGHT_RIDGE.forEach(([u, v], i) => (i ? g.lineTo(u, v + dy) : g.moveTo(u, v + dy)))
        g.lineTo(RIGHT_RIDGE[RIGHT_RIDGE.length - 1][0], 0.62 + dy)
        g.lineTo(RIGHT_RIDGE[0][0], 0.62 + dy)
        g.closePath()
        g.fill()
    }
    }

    const uA = gBox.u0 - 0.05,
        uB = gBox.u1 + 0.05
    const STEPS = Math.max(40, Math.ceil((uB - uA) * 120))
    g.beginPath()
    for (let i = 0; i <= STEPS; i++) {
        const u = uA + ((uB - uA) * i) / STEPS
        const v = edge(u) + dy - 0.004
        i ? g.lineTo(u, v) : g.moveTo(u, v)
    }
    g.lineTo(uB, gBox.v1 + 0.05)
    g.lineTo(uA, gBox.v1 + 0.05)
    g.closePath()
    const e0 = 0.496 + dy
    const fgr = g.createLinearGradient(0, e0, 0, e0 + 0.6)
    if (open) {
        const far = parseColor(adv.fieldFar, [8, 30, 62, 1]),
            mid = parseColor(adv.fieldMid, [4, 26, 28, 1]),
            near = parseColor(adv.fieldNear, [0, 6, 16, 1])
        fgr.addColorStop(0, rgba(mix(far, fl, 0.22)))
        fgr.addColorStop(0.07, rgba(far))
        fgr.addColorStop(0.32, rgba(mid))
        fgr.addColorStop(1, rgba(near))
    } else {
        fgr.addColorStop(0, rgba(mix(fl, [8, 24, 60, 1], 0.72)))
        fgr.addColorStop(0.05, "rgba(8,30,62,1)")

        fgr.addColorStop(0.18, "rgba(4,26,28,1)")
        fgr.addColorStop(0.45, "rgba(3,20,17,1)")
        fgr.addColorStop(0.7, "rgba(1,10,16,1)")
        fgr.addColorStop(1, "rgba(0,6,16,1)")
    }
    g.fillStyle = fgr
    g.fill()

    if (!open && gBox.u0 < TERRACE_END) {
        g.beginPath()
        const n = 60
        const ua = Math.max(gBox.u0 - 0.05, -40)
        for (let i = 0; i <= n; i++) {
            const u = ua + ((TERRACE_END - ua) * i) / n
            const v = terraceAt(u) + dy
            i ? g.lineTo(u, v) : g.moveTo(u, v)
        }
        for (let i = n; i >= 0; i--) {
            const u = ua + ((TERRACE_END - ua) * i) / n
            g.lineTo(u, edgeAt(u) + dy)
        }
        g.closePath()
        g.fillStyle = "rgba(12,24,42,1)"
        g.fill()
    }

    if (adv.hazeOpacity > 0) {
        const ho = adv.hazeOpacity / 100

        g.save()
        g.beginPath()
        for (let i = 0; i <= STEPS; i++) {
            const u = uA + ((uB - uA) * i) / STEPS
            const v = edge(u) + dy - 0.003
            i ? g.lineTo(u, v) : g.moveTo(u, v)
        }
        g.strokeStyle = rgba(haze, 0.07 * ho)
        g.lineWidth = 0.006
        g.shadowColor = rgba(haze, 0.12 * ho)
        g.shadowBlur = 0.012 * r
        g.lineJoin = "round"
        g.stroke()
        g.restore()
    }

    // The pass's path, its pebbles and the lone walker.
    if (!open) {
    const pCol = parseColor(adv.pathColor, [4, 20, 44, 1])
    const left: number[] = [],
        right: number[] = []
    const pv1 = Math.max(gBox.v1 + 0.1, 1.05)
    for (let v = PATH_V0; v <= pv1 - dy; v += 0.005) {
        pathAt(v, PATH_TMP)
        left.push(PATH_TMP.c - PATH_TMP.h, v + dy)
        right.push(PATH_TMP.c + PATH_TMP.h, v + dy)
    }
    g.save()
    g.beginPath()
    for (let i = 0; i < left.length; i += 2) i ? g.lineTo(left[i], left[i + 1]) : g.moveTo(left[i], left[i + 1])
    for (let i = right.length - 2; i >= 0; i -= 2) g.lineTo(right[i], right[i + 1])
    g.closePath()
    const pgr = g.createLinearGradient(0, PATH_V0 + dy, 0, 1 + dy)
    pgr.addColorStop(0, rgba(mix(pCol, haze, 0.15)))
    pgr.addColorStop(0.1, rgba(pCol))
    pgr.addColorStop(0.55, rgba(mix(pCol, [0, 0, 0, 1], 0.35)))
    pgr.addColorStop(1, rgba(mix(pCol, [0, 2, 10, 1], 0.6)))
    g.fillStyle = pgr
    g.shadowColor = rgba(pCol)
    g.shadowBlur = 6
    g.fill()
    g.restore()
    for (let i = 0; i < adv.pebbleCount; i++) {
        const t = 0.25 + 0.6 * R()
        const v = PATH_V0 + t * (1 - PATH_V0)
        pathAt(v, PATH_TMP)
        const u = PATH_TMP.c + (R() * 2 - 1) * PATH_TMP.h * 0.75
        const rr = (0.002 + 0.008 * t) * (0.6 + 0.6 * R())
        g.fillStyle = "rgba(30,46,90,0.85)"
        g.beginPath()
        g.ellipse(u, v + dy, rr, rr * 0.55, 0, 0, TAU)
        g.fill()
        g.fillStyle = "rgba(90,130,220,0.3)"
        g.beginPath()
        g.ellipse(u - rr * 0.2, v + dy - rr * 0.22, rr * 0.5, rr * 0.22, 0, 0, TAU)
        g.fill()
    }

    g.fillStyle = "#02040C"
    g.beginPath()
    FIGURE.forEach(([u, v], i) => (i ? g.lineTo(u, v + dy) : g.moveTo(u, v + dy)))
    g.closePath()
    g.fill()
    }

    const gc = parseColor(adv.grassColor, [5, 38, 27, 1])
    const sc = parseColor(adv.stemColor, [15, 90, 58, 1])
    const gl = parseColor(adv.grassLit, [46, 156, 114, 1])

    type Tuft = { u: number; v: number; z: number; seed: number }
    const tufts: Tuft[] = []
    const perUZ = adv.grassCount / (1.5 * 0.52) / 1.3
    const zMax = gBox.v1 - (0.5 + dy) + 0.3
    for (let ti = Math.floor(gBox.u0 / TILE); ti * TILE < gBox.u1; ti++) {
        for (let bz = 0.03, bi = 0; bz < zMax; bz += 0.05, bi++) {
            const Rg = rng(Math.imul(ti + 5003, 2711) ^ Math.imul(bi + 17, 9157) ^ Math.imul(adv.seed | 0, 6007))
            const want = perUZ * TILE * 0.05 * smooth(0.04, 0.14, bz)
            let cnt = Math.floor(want) + (Rg() < want % 1 ? 1 : 0)
            while (cnt-- > 0) {
                const u = (ti + Rg()) * TILE
                const z = bz + Rg() * 0.05
                const v = edge(u) + dy + z
                const t: Tuft = { u, v, z, seed: (Rg() * 1e9) | 0 }
                if (!open && inPath(u, v, dy, 0.006)) continue
                tufts.push(t)
            }
        }
    }
    type Item = { v: number; tuft: Tuft | null; bloom: Bloom | null }
    const items: Item[] = tufts.map((t) => ({ v: t.v, tuft: t, bloom: null }))
    for (const b of baked) items.push({ v: b.bv, tuft: null, bloom: b })
    items.sort((a, b) => a.v - b.v)

    const glowA = 0.05 * glowK
    const dark = rgba(mix(gc, [0, 0, 0, 1], 0.35), 0.97)
    for (const it of items) {
        const tf = it.tuft
        if (tf) {
            const Rb = rng(tf.seed)
            const nb = 3 + ((Rb() * 5) | 0)
            const fan = 0.5 + 0.7 * Rb()
            for (let k = 0; k < nb; k++) {
                const lenB = 0.32 * tf.z * (0.45 + 0.85 * Rb())
                const a0 = (k / Math.max(1, nb - 1) - 0.5) * fan + (Rb() - 0.5) * 0.3

                const arch = a0 * (0.6 + 1.4 * Rb())
                const bw = Math.max(px * 1.2, 0.03 * tf.z * (0.6 + 0.8 * Rb()))
                const ru = tf.u + (Rb() - 0.5) * 0.006 * tf.z * 10
                const mx = ru + Math.sin(a0) * lenB * 0.55,
                    my = tf.v - Math.cos(a0) * lenB * 0.6
                const tx = ru + Math.sin(a0 + arch) * lenB,
                    ty = tf.v - Math.cos(a0 + arch) * lenB * 0.95
                const lit = Rb() * (1 - 0.6 * smooth(0.3, 0.6, tf.z))
                g.fillStyle = lit < 0.35 ? dark : rgba(mix(gc, sc, (lit - 0.5) * 1.2), 0.95)
                g.beginPath()
                g.moveTo(ru - bw / 2, tf.v)
                g.quadraticCurveTo(mx - bw * 0.35, my, tx, ty)
                g.quadraticCurveTo(mx + bw * 0.35, my, ru + bw / 2, tf.v)
                g.closePath()
                g.fill()
                if (lit > 0.6) {
                    g.strokeStyle = rgba(gl, 0.3 + 0.5 * (lit - 0.6))
                    g.lineWidth = Math.max(px * 0.6, bw * 0.3)
                    g.beginPath()
                    g.moveTo(ru, tf.v)
                    g.quadraticCurveTo(mx, my, tx, ty)
                    g.stroke()
                }
            }
            continue
        }
        const f = it.bloom as Bloom
        const spr = sprites[f.pose % sprites.length]
        const hv = f.bv - f.stem
        const s = f.R / spr.r
        g.save()
        g.translate(f.bu, hv)
        g.rotate(f.lean)
        g.globalAlpha = f.alpha
        g.drawImage(spr.c, spr.sx, spr.sy, spr.sw, spr.sh, -spr.ox * s, -spr.oy * s, spr.sw * s, spr.sh * s)
        g.restore()
        if (glowA > 0) {
            const gs = f.R * 2.2
            g.globalCompositeOperation = "lighter"
            g.globalAlpha = Math.min(1, glowA)
            g.drawImage(glowSpr, f.bu - gs / 2, hv - gs * 0.4, gs, gs * 0.8)
            g.globalCompositeOperation = "source-over"
            g.globalAlpha = 1
        }
    }

    const cBox: Box = {
        u0: gBox.u0,
        u1: gBox.u1,
        v0: (open ? OPEN_EDGE_MIN : Math.min(...TERRACE.slice(1).map((p) => p[1]))) + dy - 0.012,
        v1: 0.51 + dy + 0.03,
    }
    if (cBox.v0 < gBox.v0) cBox.v0 = gBox.v0
    const cw = Math.max(1, (cBox.u1 - cBox.u0) * r),
        ch = Math.max(1, (cBox.v1 - cBox.v0) * r)
    const carpet = [0, 1, 2].map(() => makeCanvas(cw, ch))
    const cx = carpet.map((cv) => {
        const k = ctx2d(cv)
        k.setTransform(r, 0, 0, r, -cBox.u0 * r, -cBox.v0 * r)
        return k
    })

    const pale = mix(fl, [170, 240, 255, 1], 0.85),
        mid = mix(fl, [20, 110, 160, 1], 0.6)
    const perU = (adv.carpetCount / 1.5) * 3.5
    for (let ti = Math.floor(cBox.u0 / TILE); ti * TILE < cBox.u1; ti++) {
        const Rc = rng(Math.imul(ti + 101, 7333) ^ Math.imul(adv.seed | 0, 31337))
        const want = perU * TILE
        for (let n = 0; n < want; n++) {
            const u = (ti + Rc()) * TILE
            const terr = !open && u < TERRACE_END && Rc() < 0.3
            const z = SOW_Z0 * 2 * Math.pow(Rc(), 1.15)
            const v = terr ? terraceAt(u) + dy + Rc() * 0.012 : edge(u) + dy + z
            const rr = Math.max(px * 0.8, SIZE_PER_DEPTH * Math.max(z, 0.004) * 0.85 * fs) * (0.6 + 0.8 * Rc())
            const col = mix(pale, mid, Rc())
            const a = 0.55 + 0.45 * Rc()
            const k = cx[(Rc() * 3) | 0]
            if (!open && inPath(u, v, dy, 0.001)) continue
            k.fillStyle = rgba(col, a)
            k.beginPath()
            k.ellipse(u, v, rr, rr * 0.72, 0, 0, TAU)
            k.fill()
        }
    }
    return { ground: c, groundBox: gBox, carpet, carpetBox: cBox }
}

function frameScale(W: number, H: number, zoom: number) {
    return Math.min(H, W / REF_ASPECT) * zoom
}

interface Vals {
    background: string
    sceneScale: number
    density: number
    stars: number
    scale: number
    flowerColor: string
    glow: number
    swayIntensity: number
    speed: number
    placement: BluebellPassPlacement
    sway: BluebellPassSway
    advanced: Adv
    landscape: BluebellLandscape
    sky: boolean
}
function sameVals(a: Vals, b: Vals) {
    for (const k of Object.keys(b) as (keyof Vals)[]) {
        const x = a[k],
            y = b[k]
        if (x === y) continue
        if (typeof x !== "object" || typeof y !== "object" || !x || !y) return false
        const xo = x as unknown as Record<string, unknown>,
            yo = y as unknown as Record<string, unknown>
        for (const kk of Object.keys(yo)) if (xo[kk] !== yo[kk]) return false
    }
    return true
}

function __OriginkitBase_BluebellPass(props: BluebellPassProps) {
    props = withMovedControls(props)
    const {
        background = DEFAULTS.background,
        sceneScale = DEFAULTS.sceneScale,
        density = DEFAULTS.density,
        stars = DEFAULTS.stars,
        scale = DEFAULTS.scale,
        flowerColor = DEFAULTS.flowerColor,
        glow = DEFAULTS.glow,
        swayIntensity = DEFAULTS.swayIntensity,
        speed = DEFAULTS.speed,
        landscape = DEFAULTS.landscape,
        sky = DEFAULTS.sky,
        style,
    } = props
    const placement = { ...DEFAULT_PLACEMENT, ...props.placement }
    const sway = { ...DEFAULT_SWAY, ...props.sway }
    const advanced = { ...DEFAULT_ADVANCED, ...props.advanced }
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const next: Vals = {
        background,
        sceneScale,
        density,
        stars,
        scale,
        flowerColor,
        glow,
        swayIntensity,
        speed,
        placement,
        sway,
        advanced,
        landscape,
        sky,
    }
    const valsRef = useRef<Vals>(next)
    const dirtyRef = useRef(false)
    if (!sameVals(valsRef.current, next)) {
        valsRef.current = next
        dirtyRef.current = true
    }
    const wakeRef = useRef<() => void>(() => {})
    useEffect(() => {
        if (dirtyRef.current) wakeRef.current()
    })

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!root || !canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const reduce = !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches

        let W = 0,
            H = 0,
            dpr = 1,
            shown = 1,
            quality = 1,
            kBuf = 1,
            kFull = 1
        let raf = 0,
            lastNow = -1,
            due = 0,
            t = 0,
            tc = 0,
            onScreen = true,
            frames = 0,
            costEma = 0,
            slowRun = 0,
            fastRun = 0,
            physAcc = 0,
            physAwake = false,
            sizeDirty = true
        const ptr = {
            cx: 0,
            cy: 0,
            moved: false,
            over: 0,
            overE: 0,
            down: 0,
            downE: 0,
            fx: 0,
            fy: 0,
            wu: 0,
            wv: 0,
            pu: 0,
            pv: 0,
            vu: 0,
            vv: 0,
            fresh: true,
        }
        let rect: DOMRect | null = null
        let rectDirty = true
        let layers: Layers | null = null
        let layerKey = ""
        let live: Bloom[] = []
        let th = new Float32Array(0),
            om = new Float32Array(0),
            wgt = new Float32Array(0),
            drive = new Float32Array(0),
            push = new Float32Array(0)

        let variants: Sprite[][] = []
        let heroSpr: Sprite[] = []
        let heroScale = -1
        let spriteVer = 0,
            heroVer = -1
        let glowS: Sprite | null = null
        let starSpr: Sprite[] = []
        let starK = -1
        let glowCore: HTMLCanvasElement | null = null
        let glowCoreKey = ""
        let fx = new Float32Array(0),
            fy = new Float32Array(0),
            frot = new Float32Array(0),
            fr = new Float32Array(0)
        let spriteKey = ""
        let glowSpr: HTMLCanvasElement | null = null
        let lightSpr: HTMLCanvasElement | null = null
        let lightKey = ""
        let starsList: Float32Array = new Float32Array(0)
        let starKey = ""
        let vigGrad: CanvasGradient | null = null
        let vigKey = ""
        let tiltCss = ""
        let palette: Palette | null = null
        const back = makeCanvas(1, 1)
        const bctx = ctx2d(back)
        let backAge = 0,
            backDirty = true,
            curFps = 30,
            lastTick = -1,
            cadence = 16.7,
            lastDraw = -1,
            gapEma = 16.7
        let stemKey = "",
            stemDark = "",
            stemLit = ""

        const tile = makeCanvas(160, 160)
        {
            const tc = ctx2d(tile)
            const id = tc.createImageData(160, 160)
            for (let i = 0; i < id.data.length; i += 4) {
                const n = Math.random() * 255
                id.data[i] = id.data[i + 1] = id.data[i + 2] = n
                id.data[i + 3] = 255
            }
            tc.putImageData(id, 0, 0)
        }
        const grainPattern = ctx.createPattern(tile, "repeat")

        const sizeCanvas = () => {
            kFull = Math.min(dpr * clamp(shown, 1, 2), Math.sqrt(4.2e6 / Math.max(1, W * H)))
            const k = kFull * quality
            const bw = Math.max(1, Math.round(W * k)),
                bh = Math.max(1, Math.round(H * k))
            if (canvas.width !== bw || canvas.height !== bh) {
                canvas.width = bw
                canvas.height = bh
                back.width = bw
                back.height = bh
                backDirty = true
            }
            kBuf = bw / W
        }
        const measure = () => {
            const r = root.getBoundingClientRect()
            rect = r
            rectDirty = false
            if (W > 0) {
                const s = r.width / W
                if (Math.abs(s - shown) / shown > 0.05) {
                    shown = s
                    sizeDirty = true
                }
            }
        }
        const ro = new ResizeObserver((ents) => {
            const cr = ents[0].contentRect
            if (!cr.width || !cr.height) return
            W = cr.width
            H = cr.height
            dpr = Math.min(2, window.devicePixelRatio || 1)
            measure()
            sizeDirty = true

            drawNow()
        })
        const io = new IntersectionObserver((ents) => {
            const e = ents[ents.length - 1]
            onScreen = e.isIntersecting
            if (onScreen) wake()
        })
        ro.observe(root)
        io.observe(root)

        const onMove = (e: PointerEvent) => {
            if (e.clientX === ptr.cx && e.clientY === ptr.cy && ptr.over) return
            ptr.cx = e.clientX
            ptr.cy = e.clientY
            ptr.moved = true
            if (!ptr.over) ptr.fresh = true
            ptr.over = 1
            wake()
        }
        const onLeave = () => {
            ptr.over = 0
            ptr.down = 0
            wake()
        }
        const onDown = (e: PointerEvent) => {
            onMove(e)
            ptr.down = 1
        }
        const onUp = (e: PointerEvent) => {
            ptr.down = 0
            if (e.pointerType === "touch") ptr.over = 0
            wake()
        }
        const onScroll = () => {
            rectDirty = true
        }
        root.addEventListener("pointermove", onMove)
        root.addEventListener("pointerenter", onMove)
        root.addEventListener("pointerleave", onLeave)
        root.addEventListener("pointerdown", onDown)
        window.addEventListener("pointerup", onUp)
        window.addEventListener("pointercancel", onUp)
        window.addEventListener("scroll", onScroll, { passive: true, capture: true })
        const onVis = () => wake()
        document.addEventListener("visibilitychange", onVis)

        const onRestored = () => {
            spriteKey = ""
            layerKey = ""
            heroScale = -1
            backDirty = true
            sizeDirty = true
            wake()
        }
        canvas.addEventListener("contextrestored", onRestored)

        const ensureScene = (v: Vals, adv: Adv, S: number, box: Box) => {
            const fl = parseColor(v.flowerColor, [4, 104, 251, 1])
            const fs = v.scale / 100
            const sk = [v.flowerColor, adv.squash, adv.defocus, v.glow, adv.glowSize].join("|")
            if (sk !== spriteKey) {
                spriteKey = sk
                palette = makePalette(fl)

                const palFar = makePalette(mix(fl, [40, 135, 200, 1], 0.5))
                const sq = clamp(adv.squash / 100, 0.15, 0.97)
                const R = rng(adv.seed * 41 + 3)
                const blurK = adv.defocus / 7
                variants = []
                for (let i = 0; i < 8; i++) {
                    const pose = makePose(R, Math.asin(clamp(sq * (0.8 + 0.4 * R()), 0.15, 0.97)), (74 + 10 * R()) * DEG)
                    variants.push([
                        flowerSprite(28, { ...pose, core: 0.65 }, palFar, 0),
                        flowerSprite(56, pose, palette, 0),
                        flowerSprite(100, pose, palette, 0),
                        flowerSprite(100, pose, palette, 3.5 * blurK),
                        flowerSprite(100, pose, palette, 7.5 * blurK),
                        flowerSprite(16, { ...pose, core: 0.55 }, palFar, 0, {
                            col: mix(fl, [70, 200, 255, 1], 0.3),
                            a: Math.min(1, 0.2 * (v.glow / 60)),
                            size: adv.glowSize / 100,
                        }),
                    ])
                }

                glowSpr = radialSprite(mix(fl, [70, 200, 255, 1], 0.3), [
                    [0, 0.75],
                    [0.45, 0.3],
                    [0.85, 0.06],
                    [1, 0],
                ])
                glowS = {
                    c: glowSpr,
                    sx: 0,
                    sy: 0,
                    sw: glowSpr.width,
                    sh: glowSpr.height,
                    r: 1,
                    ox: glowSpr.width / 2,
                    oy: glowSpr.height / 2,
                }
                packAtlas([...variants.flat(), glowS])
                spriteVer++
                layerKey = ""
            }

            const res = S * kFull
            const lk = [
                adv.seed, adv.horizonY, adv.carpetCount, adv.flowerCount, adv.grassCount, adv.pebbleCount,
                adv.skyTop, adv.skyMid, adv.skyHorizon, adv.cloudColor, adv.cloudOpacity, adv.milkyColor,
                adv.milkyOpacity, adv.milkyWidth, adv.mountainColor, adv.rimColor, adv.peakLight, adv.peakShadow,
                adv.hazeColor, adv.hazeOpacity, adv.stemColor, adv.grassColor, adv.grassLit, adv.pathColor,
                adv.fieldFar, adv.fieldMid, adv.fieldNear, v.landscape, v.sky,
                v.density, v.scale, v.glow, spriteKey,
            ].join("|")
            const L = layers
            const inside =
                L && box.u0 >= L.box.u0 && box.u1 <= L.box.u1 && box.v0 >= L.box.v0 && box.v1 <= L.box.v1
            const resOk = L && res / L.res > 0.8 && res / L.res < 1.25
            if (L && inside && resOk && lk === layerKey) return
            layerKey = lk
            backDirty = true

            const pu = (box.u1 - box.u0) * 0.15,
                pv = (box.v1 - box.v0) * 0.15
            const bb: Box = { u0: box.u0 - pu, u1: box.u1 + pu, v0: box.v0 - pv, v1: box.v1 + pv }
            const zLive = LIVE_MIN_PX / (SIZE_PER_DEPTH * S * fs)
            const baked: Bloom[] = []
            const nl: Bloom[] = []
            const open = v.landscape === "open"
            sowFlowers(bb, adv, v.density, fs, zLive, nl, baked, open)
            live = nl
            const n = live.length
            th = new Float32Array(n)
            fx = new Float32Array(n)
            fy = new Float32Array(n)
            frot = new Float32Array(n)
            fr = new Float32Array(n)
            om = new Float32Array(n)
            wgt = new Float32Array(n)
            drive = new Float32Array(n)
            push = new Float32Array(n)
            const skyL = v.sky ? buildSkyLayers(bb, res, adv) : null
            const gr = buildGround(
                bb,
                res,
                adv,
                fl,
                baked,
                variants.map((s) => s[0]),
                glowSpr as HTMLCanvasElement,
                v.glow / 60,
                fs,
                open
            )
            layers = {
                box: bb,
                res,
                skyL,
                ground: gr.ground,
                groundBox: gr.groundBox,
                carpet: gr.carpet,
                carpetBox: gr.carpetBox,
            }

            const stk = [adv.seed, adv.milkyWidth, bb.u0.toFixed(2), bb.u1.toFixed(2), bb.v0.toFixed(2)].join("|")
            if (v.sky && stk !== starKey) {
                starKey = stk

                const out: number[] = []
                const w = Math.max(0.005, adv.milkyWidth / 100)
                const vTop = Math.min(bb.v0, 0)
                const tintOf = (r: number) => (r < 0.4 ? 0 : r < 0.75 ? 1 : r < 0.95 ? 2 : 3)
                const typeOf = (r: number) => (r < 0.012 ? 3 : r < 0.055 ? 2 : r < 0.3 ? 1 : 0)
                for (let ti = Math.floor(bb.u0 / TILE); ti * TILE < bb.u1; ti++)
                    for (let tj = Math.floor(vTop / TILE); tj * TILE < 0.5; tj++) {
                        const R = rng(Math.imul(ti + 401, 6151) ^ Math.imul(tj + 911, 3307) ^ Math.imul(adv.seed | 0, 2221))
                        const vc = (tj + 0.5) * TILE
                        const dens = 1500 * (1 - 0.45 * smooth(0.05, 0.35, vc))
                        const cnt = Math.round(dens * TILE * TILE)
                        for (let i = 0; i < cnt; i++) {
                            const u = (ti + R()) * TILE,
                                v = (tj + R()) * TILE
                            const ty = typeOf(R())
                            const row = [u, v, ty, 0.45 + 0.55 * R(), [1, 0.5, 0.25][(R() * 3) | 0], R() * TAU, tintOf(R()), R(), 0]

                            if (u >= bb.u0 && u < bb.u1) out.push(...row)
                        }
                    }

                const R = rng(adv.seed * 7 + 3)
                for (let i = 0; i < 90; i++) {
                    const sa = 0.05 + R() * 0.32
                    const d = (R() + R() + R() - 1.5) * w * 1.1
                    out.push(sa, d, R() < 0.06 ? 2 : R() < 0.35 ? 1 : 0, 0.35 + 0.5 * R(), [1, 0.5, 0.25][(R() * 3) | 0], R() * TAU, R() < 0.6 ? 0 : 2, R(), 1)
                }
                starsList = new Float32Array(out)
            }
        }

        const ensureHeroes = (scale: number) => {
            const sc = Math.round(Math.log2(Math.max(1e-6, scale)) * 4)
            if (sc === heroScale && heroVer === spriteVer) return
            heroScale = sc
            heroVer = spriteVer
            const blurK = valsRef.current.advanced.defocus / 7
            const fs = valsRef.current.scale / 100
            const kk = Math.pow(2, sc / 4)
            heroSpr = HEROES.map(([, , r, pitch, , blur], i) => {
                const Rdev = r * PX * fs * (pitch < 20 ? 1.25 : 1.12) * kk
                const rs = Math.min(blur > 0 ? 110 : 200, Math.max(16, Rdev))
                const R = rng(1000 + i * 17)
                const pose = makePose(R, pitch * DEG, 78 * DEG)
                pose.width = 0.3
                if (pitch < 20) {
                    pose.fan = 2.1
                    pose.petals = 5
                    pose.width = 0.25
                    pose.curl = -0.1
                }
                return flowerSprite(rs, pose, palette as Palette, ((blur * blurK) / r) * rs)
            })
            packAtlas(heroSpr)
        }

        let animating = false
        const wake = () => {
            if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame)
        }
        wakeRef.current = () => {
            dirtyRef.current = true
            wake()
        }
        const frame = (now: number) => {
            raf = 0

            if (lastTick >= 0) cadence = Math.min(Math.min(100, now - lastTick), cadence + 0.2)
            lastTick = now
            if (!onScreen || document.hidden || !W || !H) {
                lastNow = -1
                return
            }

            const active =
                physAwake ||
                ptr.moved ||
                Math.abs(ptr.over - ptr.overE) > 0.002 ||
                Math.abs(ptr.down - ptr.downE) > 0.002
            const fps = active ? 60 : animating ? 30 : 0
            const dirty = dirtyRef.current || sizeDirty
            if (fps === 0 && !dirty) {
                lastNow = -1
                lastTick = -1
                return
            }
            if (fps !== curFps) {
                curFps = fps
                lastDraw = -1
                gapEma = Math.max(1000 / Math.max(fps, 30), cadence)
            }
            raf = requestAnimationFrame(frame)
            if (!dirty && now < due - 3) return
            due = now - due > 250 ? now + 1000 / Math.max(fps, 30) : due + 1000 / Math.max(fps, 30)
            const dt = lastNow < 0 ? 0 : Math.min(0.05, (now - lastNow) / 1000)
            lastNow = now
            const c0 = performance.now()
            draw(dt)
            const cost = performance.now() - c0
            if (lastDraw >= 0) gapEma += (Math.min(200, now - lastDraw) - gapEma) * 0.1
            lastDraw = now

            const want = Math.max(1, Math.ceil(1000 / Math.max(fps, 30) / cadence - 0.05)) * cadence
            if (++frames > 30) {
                costEma += (cost - costEma) * 0.1
                if (costEma > 14 || gapEma > want * 1.35) {
                    slowRun++
                    fastRun = 0
                } else if (costEma < 6 && gapEma < want * 1.12) {
                    fastRun++
                    slowRun = 0
                } else slowRun = fastRun = 0
                if (slowRun > 20 && quality > 0.6) {
                    quality = Math.max(0.6, quality - 0.1)
                    slowRun = 0
                    sizeDirty = true
                } else if (fastRun > 120 && quality < 1) {
                    quality = Math.min(1, quality + 0.1)
                    fastRun = 0
                    sizeDirty = true
                }
            }
        }
        const drawNow = () => {
            if (!W || !H) return
            draw(0)
            wake()
        }

        const draw = (dt: number) => {
            const v = valsRef.current
            const adv = v.advanced
            if (dirtyRef.current) backDirty = true
            dirtyRef.current = false
            if (sizeDirty) {
                sizeCanvas()
                sizeDirty = false
            }
            animating = !reduce && v.speed > 0
            const loop = Math.max(0.5, adv.loopMs / 1000)
            const rate = reduce ? 0 : Math.max(0, v.speed) / 50
            t = (t + dt * rate) % loop

            tc += dt * rate
            const hoverK = reduce ? 0 : Math.max(0, adv.hover) / 50
            ptr.overE += (ptr.over - ptr.overE) * (1 - Math.exp(-dt / 0.13))
            ptr.downE += (ptr.down - ptr.downE) * (1 - Math.exp(-dt / 0.1))
            if (dt === 0) {
                ptr.overE = ptr.over ? Math.max(ptr.overE, 0) : ptr.overE
            }

            const zoom = clamp(v.sceneScale / 100, 0.05, 2)
            const S = frameScale(W, H, zoom)
            const pl = v.placement
            const ox = (pl.x / 100) * W,
                oy = (pl.y / 100) * H
            const ang = pl.angle * DEG
            const ca = Math.cos(ang),
                sa = Math.sin(ang)
            const Cx = W / 2 + ox,
                Cy = H / 2 + oy

            const tilt = clamp(pl.tilt, -60, 60)
            const persp = 2 * Math.max(W, H)
            const css = tilt ? `perspective(${persp}px) rotateX(${tilt}deg)` : ""
            if (css !== tiltCss) {
                tiltCss = css
                canvas.style.transform = css
                canvas.style.transformOrigin = `${Cx}px ${Cy}px`
            } else if (css) canvas.style.transformOrigin = `${Cx}px ${Cy}px`
            const toWorld = (x: number, y: number, o: { u: number; v: number }) => {
                const dx = x - Cx,
                    dy = y - Cy
                o.u = (ca * dx + sa * dy) / S
                o.v = (-sa * dx + ca * dy) / S + 0.5
                return o
            }
            const tmp = { u: 0, v: 0 }
            const box: Box = { u0: Infinity, u1: -Infinity, v0: Infinity, v1: -Infinity }
            for (const [x, y] of [
                [0, 0],
                [W, 0],
                [0, H],
                [W, H],
            ]) {
                toWorld(x, y, tmp)
                box.u0 = Math.min(box.u0, tmp.u)
                box.u1 = Math.max(box.u1, tmp.u)
                box.v0 = Math.min(box.v0, tmp.v)
                box.v1 = Math.max(box.v1, tmp.v)
            }
            ensureScene(v, adv, S, box)
            const Lr = layers as Layers
            const k = kBuf
            const sk4 = Math.round(k * 4) / 4
            if (sk4 !== starK) {
                starK = sk4
                starSpr = starSprites(sk4)
                backDirty = true
            }
            if (!glowCore || glowCoreKey !== adv.milkyColor) {
                glowCoreKey = adv.milkyColor
                glowCore = radialSprite(mix(parseColor(adv.milkyColor, [185, 208, 255, 1]), [120, 200, 255, 1], 0.4), [
                    [0, 0.55],
                    [0.25, 0.22],
                    [0.6, 0.05],
                    [1, 0],
                ])
                backDirty = true
            }
            const ma = k * S * ca,
                mb = k * S * sa,
                mc = -k * S * sa,
                md = k * S * ca
            const me = k * Cx + k * S * sa * 0.5,
                mf = k * Cy - k * S * ca * 0.5
            const X = (u: number, vv: number) => ma * u + mc * vv + me
            const Y = (u: number, vv: number) => mb * u + md * vv + mf
            const dyH = adv.horizonY / 100 - 0.5

            if (ptr.over || ptr.overE > 0.002) {
                if (ptr.moved || rectDirty || !rect) {
                    measure()
                    const r = rect as DOMRect
                    let x = ((ptr.cx - r.left) / r.width) * W
                    let y = ((ptr.cy - r.top) / r.height) * H
                    if (tilt) {
                        const tr = tilt * DEG
                        const Y0 = y - Cy
                        const yy = (Y0 * persp) / (persp * Math.cos(tr) + Y0 * Math.sin(tr))
                        x = Cx + ((x - Cx) * (persp - yy * Math.sin(tr))) / persp
                        y = Cy + yy
                    }
                    ptr.fx = x
                    ptr.fy = y
                    ptr.moved = false
                }
                toWorld(ptr.fx, ptr.fy, tmp)
                if (ptr.fresh) {
                    ptr.pu = tmp.u
                    ptr.pv = tmp.v
                    ptr.fresh = false
                }
                ptr.wu = tmp.u
                ptr.wv = tmp.v
                if (dt > 0) {
                    const ku = 1 - Math.exp(-dt / 0.05)
                    ptr.vu += ((ptr.wu - ptr.pu) / dt - ptr.vu) * ku
                    ptr.vv += ((ptr.wv - ptr.pv) / dt - ptr.vv) * ku
                }
                ptr.pu = ptr.wu
                ptr.pv = ptr.wv
            } else {
                ptr.vu = ptr.vv = 0
                ptr.fresh = true
            }

            const sw = v.sway
            const pAct = ptr.overE * hoverK
            const reach = 0.03 + 0.016 * clamp(sw.reach, 0, 10)
            const swK = clamp(v.swayIntensity / 100, 0, 1) * hoverK
            const toward = sw.lean !== "away" ? -1 : 1
            const zeta = clamp(0.95 - 0.085 * clamp(sw.bounce, 0, 10), 0.08, 1)
            const n = live.length
            let anyPush = false
            for (let i = 0; i < n; i++) {
                const f = live[i]
                wgt[i] = 0
                push[i] = 0
                drive[i] = 0
                if (pAct < 0.001 || swK <= 0) continue
                const hu = f.bu,
                    hv = f.bv - f.stem
                const rr = reach + f.R * 0.8
                const dx = hu - ptr.wu,
                    dvv = hv - ptr.wv
                const q = (dx * dx + dvv * dvv) / (rr * rr)
                if (q > 9) continue
                const w = Math.exp(-q) * pAct
                wgt[i] = w

                push[i] = toward * swK * 0.9 * w * clamp((dx / rr) * 1.6, -1, 1)
                drive[i] = swK * 15 * w * clamp(ptr.vu, -3, 3)
                anyPush = true
            }
            if (anyPush) physAwake = true
            if (physAwake && dt > 0) {
                const STEP = 1 / 120
                physAcc = Math.min(physAcc + dt, 0.05)
                let energy = 0
                while (physAcc >= STEP) {
                    physAcc -= STEP
                    for (let i = 0; i < n; i++) {
                        const f = live[i]

                        const w0 = TAU * (2.6 - 1.2 * clamp(f.R / 0.08))
                        const a = -w0 * w0 * (th[i] - push[i]) - 2 * zeta * w0 * om[i] + drive[i]
                        om[i] += a * STEP
                        th[i] = clamp(th[i] + om[i] * STEP, -0.95, 0.95)
                    }
                }
                for (let i = 0; i < n; i++) energy = Math.max(energy, Math.abs(th[i] - push[i]) + Math.abs(om[i]) * 0.1)

                if (energy < 5e-4) {
                    physAwake = false
                    if (!anyPush) {
                        th.fill(0)
                        om.fill(0)
                    }
                }
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.globalCompositeOperation = "source-over"
            ctx.globalAlpha = 1
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const cW = canvas.width,
                cH = canvas.height

            const paintBackdrop = (g: CanvasRenderingContext2D) => {
                const layer = (img: HTMLCanvasElement, b: Box, du = 0, dv = 0) => {
                    g.setTransform(ma, mb, mc, md, me, mf)
                    g.drawImage(img, b.u0 + du, b.v0 + dv, b.u1 - b.u0, b.v1 - b.v0)
                }
                // Sky, Milky Way, stars and clouds — skipped when `sky` is off.
                const paintSky = (SL: SkyLayers) => {
                layer(SL.sky, SL.skyBox)

                const flow = ((adv.milkyDrift / 100) * tc) / loop
                if (SL.milky) {
                    const tg = ctx2d(SL.milkyTmp)
                    const mw = SL.milky.width,
                        mh = SL.milky.height
                    const off = (((flow * SL.mres) % mw) + mw) % mw
                    tg.globalCompositeOperation = "source-over"
                    tg.clearRect(0, 0, mw, mh)
                    tg.drawImage(SL.milky, off, 0)
                    tg.drawImage(SL.milky, off - mw, 0)
                    tg.globalCompositeOperation = "destination-in"
                    tg.drawImage(SL.milkyEnv, 0, 0, mw, mh)
                    tg.globalCompositeOperation = "source-over"

                    const ir = 1 / SL.mres
                    const ou = MW_A[0] - MW_N[0] * SL.mhalf,
                        ov = MW_A[1] - MW_N[1] * SL.mhalf
                    g.setTransform(ma, mb, mc, md, me, mf)
                    g.transform(MW_D[0] * ir, MW_D[1] * ir, MW_N[0] * ir, MW_N[1] * ir, ou, ov)
                    g.drawImage(SL.milkyTmp, 0, 0)

                    const bg = ctx2d(SL.milkyBloom)
                    bg.clearRect(0, 0, SL.milkyBloom.width, SL.milkyBloom.height)
                    bg.drawImage(SL.milkyTmp, 0, 0, SL.milkyBloom.width, SL.milkyBloom.height)
                    g.globalCompositeOperation = "lighter"
                    g.globalAlpha = 0.55
                    g.drawImage(SL.milkyBloom, 0, 0, mw, mh)
                    g.globalAlpha = 1
                    g.globalCompositeOperation = "source-over"

                    if (glowCore) {
                        const cu = MW_A[0] + MW_D[0] * 0.31,
                            cv = MW_A[1] + MW_D[1] * 0.31
                        const rr = SL.mhalf * 1.6
                        g.setTransform(ma, mb, mc, md, me, mf)
                        g.globalCompositeOperation = "lighter"
                        g.globalAlpha = 0.5 * (adv.milkyOpacity / 100)
                        g.drawImage(glowCore, cu - rr, cv - rr * 1.5, rr * 2, rr * 3)
                        g.globalAlpha = 1
                        g.globalCompositeOperation = "source-over"
                    }
                }

                g.setTransform(1, 0, 0, 1, 0, 0)
                g.globalCompositeOperation = "lighter"
                const tw = (adv.starTwinkle / 100) * 0.5
                const share0 = clamp(v.stars / 100)
                const bK = 0.55 + share0 * 0.75

                const share = share0 * clamp(Math.sqrt(S / 800), 0.4, 1)
                const sl = starsList
                const Bx = Lr.box
                const Pu = Bx.u1 - Bx.u0
                const drift = ((((adv.starDrift / 100) * tc) / loop) % Pu + Pu) % Pu
                const bandSpan = 0.32
                const bflow = ((flow % bandSpan) + bandSpan) % bandSpan
                for (let i = 0; i < sl.length; i += 9) {
                    if (sl[i + 7] >= share) continue
                    let su: number,
                        sv: number,
                        fade = 1
                    if (sl[i + 8]) {
                        let sa = sl[i] - 0.05 + bflow
                        if (sa >= bandSpan) sa -= bandSpan
                        sa += 0.05
                        fade = mwFade(sa) / 0.9
                        su = MW_A[0] + MW_D[0] * sa + MW_N[0] * sl[i + 1]
                        sv = MW_A[1] + MW_D[1] * sa + MW_N[1] * sl[i + 1]
                    } else {
                        su = sl[i] + drift
                        if (su >= Bx.u1) su -= Pu
                        sv = sl[i + 1]
                    }
                    if (sv > 0.5 + dyH) continue
                    const x = X(su, sv),
                        y = Y(su, sv)
                    if (x < -24 || y < -24 || x > cW + 24 || y > cH + 24) continue
                    const a = clamp(
                        fade * sl[i + 3] * bK * (1 - tw + tw * Math.sin((TAU * t) / (loop * sl[i + 4]) + sl[i + 5]))
                    )
                    if (a < 0.01) continue
                    const sp = starSpr[sl[i + 2] * 4 + sl[i + 6]]
                    g.globalAlpha = a
                    g.drawImage(sp.c, sp.sx, sp.sy, sp.sw, sp.sh, x - sp.ox, y - sp.oy, sp.sw, sp.sh)
                }
                g.globalAlpha = 1
                g.globalCompositeOperation = "source-over"

                const cloudOff = ((adv.wind / 100) * 0.03 * tc) / loop
                const cloud = (tex: HTMLCanvasElement, mask: HTMLCanvasElement) => {
                    const tg = ctx2d(SL.cloudTmp)
                    const lw = tex.width
                    const off = (((cloudOff * (lw / (SL.skyBox.u1 - SL.skyBox.u0))) % lw) + lw) % lw
                    tg.globalCompositeOperation = "source-over"
                    tg.clearRect(0, 0, lw, tex.height)
                    tg.drawImage(tex, off, 0)
                    tg.drawImage(tex, off - lw, 0)
                    tg.globalCompositeOperation = "destination-in"
                    tg.drawImage(mask, 0, 0)
                    tg.globalCompositeOperation = "source-over"
                    layer(SL.cloudTmp, SL.skyBox)
                }
                cloud(SL.wisps, SL.wispMask)
                cloud(SL.banks, SL.bankMask)
                }
                if (Lr.skyL) paintSky(Lr.skyL)
                layer(Lr.ground, Lr.groundBox)

                for (let j = 0; j < 3; j++) {
                    g.globalAlpha = 0.78 + 0.2 * Math.sin((TAU * t) / (loop / Math.pow(2, j)) + j * 2.1)
                    layer(Lr.carpet[j], Lr.carpetBox)
                }
                g.globalAlpha = 1
            }
            {
                backAge += dt
                if (backDirty || (animating && backAge >= (curFps >= 60 ? 0.031 : 0.064))) {
                    bctx.setTransform(1, 0, 0, 1, 0, 0)
                    bctx.globalAlpha = 1
                    bctx.clearRect(0, 0, cW, cH)
                    paintBackdrop(bctx)
                    backAge = 0
                    backDirty = false
                }
                ctx.setTransform(1, 0, 0, 1, 0, 0)
                ctx.drawImage(back, 0, 0)
            }

            const amp = adv.swayAngle * DEG,
                ampN = adv.nearSway * DEG
            const spread = adv.waveSpread / 100
            const windA = (adv.wind / 100) * 7 * DEG
            if (adv.stemColor !== stemKey) {
                stemKey = adv.stemColor
                const stemCol = parseColor(adv.stemColor, [15, 90, 58, 1])
                stemDark = rgba(mix(stemCol, [0, 8, 6, 1], 0.35), 0.95)
                stemLit = rgba(mix(stemCol, WHITE, 0.25), 0.55)
            }
            const gk = v.glow / 60,
                pa = adv.pulse / 100,
                gsz = adv.glowSize / 100
            const boost = (adv.lightBoost / 100) * (1 + 0.6 * ptr.downE)
            ensureHeroes(S * kFull)

            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.lineCap = "round"
            for (let i = 0; i < n; i++) {
                const f = live[i]
                const Rdev = f.R * S * k
                fr[i] = 0
                if (Rdev < 0.5) continue
                const A = f.hero >= 0 || f.R > 0.03 ? ampN : amp
                let ang2 = A * Math.sin(TAU * (t / loop - (f.xn * spread + f.depth * 0.3)))
                if (windA > 0) {
                    const gw = 0.5 + 0.5 * Math.sin(TAU * ((2 * t) / loop - f.xn * 0.9 - f.depth * 0.2))
                    const gust = gw * gw * gw
                    const flut = Math.sin(TAU * ((12 * t) / loop) + f.gph)
                    ang2 += windA * (f.hero >= 0 ? 0.6 : 1) * (gust * (1 + 0.25 * flut) + 0.15)
                }
                ang2 += th[i]
                const sn = Math.sin(ang2),
                    cs = Math.cos(ang2)
                const hu = f.bu + sn * f.stem,
                    hv = f.bv - cs * f.stem
                const hx = X(hu, hv),
                    hy = Y(hu, hv)
                const bx = X(f.bu, f.bv),
                    by = Y(f.bu, f.bv)
                const ext = Rdev * 1.6
                const headOut = hx < -ext || hy < -ext || hx > cW + ext || hy > cH + ext
                const stemOut =
                    Math.max(by, hy) < -ext ||
                    Math.min(by, hy) > cH + ext ||
                    Math.max(bx, hx) < -ext ||
                    Math.min(bx, hx) > cW + ext
                if (headOut && stemOut) continue
                fx[i] = hx
                fy[i] = hy
                frot[i] = ang + f.lean + ang2
                fr[i] = Rdev
                if (Rdev > 12 && !stemOut) {
                    const qm = 0.5 + f.bend * 0.25
                    const cu = f.bu + sn * f.stem * 0.45 + f.bend * f.stem * 0.15,
                        cv = f.bv - f.stem * qm
                    const cxp = X(cu, cv),
                        cyp = Y(cu, cv)
                    ctx.strokeStyle = stemDark
                    ctx.lineWidth = Math.max(0.8, Rdev * 0.05)
                    ctx.beginPath()
                    ctx.moveTo(bx, by)
                    ctx.quadraticCurveTo(cxp, cyp, hx, hy)
                    ctx.stroke()
                    if (Rdev > 14) {
                        const o = Rdev * 0.012
                        ctx.strokeStyle = stemLit
                        ctx.lineWidth = Math.max(0.5, Rdev * 0.014)
                        ctx.beginPath()
                        ctx.moveTo(bx + o, by)
                        ctx.quadraticCurveTo(cxp + o, cyp, hx + o, hy)
                        ctx.stroke()
                    }
                }
            }

            for (let i = 0; i < n; i++) {
                const Rdev = fr[i]
                if (!Rdev) continue
                const f = live[i]
                let spr: Sprite
                if (f.hero >= 0) spr = heroSpr[f.hero]
                else {
                    const set = variants[f.pose % variants.length]
                    const bl = adv.defocus > 0 ? f.blur : 0
                    spr =
                        bl > 0.66
                            ? set[4]
                            : bl > 0.25
                              ? set[3]
                              : Rdev < 12
                                ? set[5]
                                : Rdev < 34
                                  ? set[0]
                                  : Rdev < 70
                                    ? set[1]
                                    : set[2]
                }
                const sc = Rdev / spr.r
                const cr = Math.cos(frot[i]) * sc,
                    srr = Math.sin(frot[i]) * sc
                ctx.setTransform(cr, srr, -srr, cr, fx[i], fy[i])
                ctx.globalAlpha = f.alpha
                ctx.drawImage(spr.c, spr.sx, spr.sy, spr.sw, spr.sh, -spr.ox, -spr.oy, spr.sw, spr.sh)
            }
            ctx.globalAlpha = 1

            const gl = glowS as Sprite
            if (gk > 0) {
                ctx.globalCompositeOperation = "lighter"
                for (let i = 0; i < n; i++) {
                    const Rdev = fr[i]
                    if (!Rdev) continue
                    const f = live[i]
                    if (f.hero < 0 && Rdev < 12 && !(adv.defocus > 0 && f.blur > 0.25)) continue
                    const g =
                        gk *
                        (1 + pa * Math.sin((TAU * t) / (loop * f.gper) + f.gph)) *
                        (1 + boost * wgt[i] * 2)

                    let a = 0.2 * g * clamp(30 / Rdev, 0.35, 1)

                    const gs = Rdev * 1.55 * gsz * Math.min(1, Math.sqrt(60 / Rdev))
                    const c = Math.cos(frot[i]),
                        sn = Math.sin(frot[i])
                    ctx.setTransform(c, sn, -sn, c, fx[i], fy[i])
                    while (a > 0.002) {
                        ctx.globalAlpha = Math.min(1, a)
                        ctx.drawImage(gl.c, gl.sx, gl.sy, gl.sw, gl.sh, -gs / 2, -gs * 0.45, gs, gs * 0.8)
                        a -= 1
                    }
                }
                ctx.globalCompositeOperation = "source-over"
                ctx.globalAlpha = 1
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0)
            if (pAct > 0.001) {
                const lk = adv.hazeColor
                if (lk !== lightKey || !lightSpr) {
                    lightKey = lk
                    lightSpr = radialSprite(parseColor(adv.hazeColor, [111, 143, 255, 1]), [
                        [0, 1],
                        [1, 0],
                    ])
                }
                const pr = Math.max(1, (adv.lightRadius / 100) * S) * k
                const px = X(ptr.wu, ptr.wv),
                    py = Y(ptr.wu, ptr.wv)
                ctx.globalCompositeOperation = "lighter"
                ctx.globalAlpha = clamp(0.16 * pAct * (1 + 0.5 * ptr.downE))
                ctx.drawImage(lightSpr, px - pr, py - pr, pr * 2, pr * 2)
                ctx.globalAlpha = 1
                ctx.globalCompositeOperation = "source-over"
            }

            if (adv.grain > 0 && grainPattern) {
                ctx.save()
                ctx.globalCompositeOperation = "overlay"
                ctx.globalAlpha = clamp((adv.grain / 100) * 0.6)
                ctx.translate(-Math.random() * 160, -Math.random() * 160)
                ctx.fillStyle = grainPattern
                ctx.fillRect(0, 0, cW + 160, cH + 160)
                ctx.restore()
            }

            if (adv.vignette > 0) {
                const vk = [cW, cH, adv.vignette].join("|")
                if (vk !== vigKey || !vigGrad) {
                    vigKey = vk
                    const rr = Math.hypot(cW, cH) / 2
                    vigGrad = ctx.createRadialGradient(cW / 2, cH / 2, rr * 0.45, cW / 2, cH / 2, rr)
                    vigGrad.addColorStop(0, "rgba(0,0,0,0)")
                    vigGrad.addColorStop(1, `rgba(0,0,0,${clamp((adv.vignette / 100) * 1.2).toFixed(3)})`)
                }
                ctx.fillStyle = vigGrad
                ctx.fillRect(0, 0, cW, cH)
            }
        }

        wake()
        return () => {
            if (raf) cancelAnimationFrame(raf)
            raf = 0
            wakeRef.current = () => {}
            ro.disconnect()
            io.disconnect()
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerenter", onMove)
            root.removeEventListener("pointerleave", onLeave)
            root.removeEventListener("pointerdown", onDown)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("pointercancel", onUp)
            window.removeEventListener("scroll", onScroll, { capture: true })
            document.removeEventListener("visibilitychange", onVis)
            canvas.removeEventListener("contextrestored", onRestored)
        }
    }, [])

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                aspectRatio: `${REF_W} / ${REF_H}`,
                touchAction: "pan-y",
                ...style,
                overflow: "hidden",
                background,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
            />
        </div>
    )
}

const __originkitPresetProps = {
  "placement": {
    "x": 0,
    "y": 0,
    "angle": 0,
    "tilt": 0
  },
  "advanced": {
    "seed": 7,
    "wind": 35,
    "grain": 0,
    "pulse": 15,
    "loopMs": 8000,
    "skyMid": "#013C97",
    "skyTop": "#021649",
    "squash": 62,
    "defocus": 7,
    "glowSize": 180,
    "grassLit": "#2E9C72",
    "horizonY": 50,
    "nearSway": 2,
    "rimColor": "#1E2A70",
    "vignette": 15,
    "hazeColor": "#6F8FFF",
    "pathColor": "#04142C",
    "peakLight": "#AFC6F5",
    "stemColor": "#0F5A3A",
    "swayAngle": 3,
    "cloudColor": "#0A1460",
    "grassColor": "#05261B",
    "grassCount": 1600,
    "lightBoost": 40,
    "milkyColor": "#B9D0FF",
    "milkyDrift": 1,
    "milkyWidth": 2,
    "peakShadow": "#06227C",
    "skyHorizon": "#0252C4",
    "waveSpread": 60,
    "carpetCount": 3500,
    "flowerCount": 420,
    "hazeOpacity": 80,
    "lightRadius": 22,
    "pebbleCount": 20,
    "starTwinkle": 60,
    "cloudOpacity": 55,
    "milkyOpacity": 60,
    "mountainColor": "#00041A"
  }
};

export default function BluebellPass(props: Record<string, unknown>) {
  return <__OriginkitBase_BluebellPass {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}
