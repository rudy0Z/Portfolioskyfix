/**
 * Case-study content model.
 *
 * A case study has upfront header metadata, a 6-chapter overview structure,
 * a dedicated 16:9 motion walkthrough slot (#case-walkthrough), a live
 * prototype modal target, and structured narrative/interactive blocks.
 * Centered 920px reader (pages/CaseStudyPage.tsx) maps blocks cleanly with
 * zero hardcoded colors in TypeScript.
 */

export type Block =
  | { t: "lede"; text: string }
  | { t: "p"; text: string }
  | { t: "pull"; text: string; cite?: string }
  | {
      t: "figure";
      src: string;
      alt: string;
      caption?: string;
      plate?: string;
      /** Explicit CSS aspect-ratio (e.g. "16 / 10" or "9 / 19.5") for zero-CLS */
      aspectRatio?: string;
      /** phone-plate: narrower, device-proportioned presentation */
      phone?: boolean;
      /** keep full 920px stage width */
      wide?: boolean;
    }
  | {
      t: "decision";
      label: string;
      title?: string;
      tension?: string;
      decision?: string;
      tradeoff?: string;
      proof?: string;
    }
  | {
      t: "disclosure";
      summary?: string;
      items: { label: string; text: string }[];
    }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string }
  | {
      t: "timeline";
      title?: string;
      items: { time: string; title: string; body: string }[];
    }
  | {
      t: "receipts";
      leftTitle: string;
      left: string[];
      rightTitle: string;
      right: string[];
    }
  | { t: "list"; items: string[]; ordered?: boolean }
  | { t: "note"; label: string; text: string }
  | { t: "chips"; items: string[] }
  | {
      t: "video";
      src: string;
      previewVideo?: string;
      poster?: string;
      duration?: string;
      caption?: string;
      plate?: string;
      foldHint?: string;
    }
  | {
      t: "embed";
      /** served from /embed/… — query or base path, no hash */
      src: string;
      /** "#…" appended as the iframe hash, or "?…" spliced before the hash */
      deepLink?: string;
      title: string;
      caption?: string;
      /** plate height in px (default 600) */
      height?: number;
      aspectRatio?: string;
    }
  | {
      t: "sentinel-stage";
      embedSrc: string;
      activeDeepLink: string;
      revertedDeepLink: string;
      caption?: string;
    }
  | {
      t: "anatomy";
      title: string;
      aspectRatio?: string;
      layers: {
        label: string;
        note: string;
        /** optional pin position on the image, in % — absent → list-only layer */
        x?: number;
        y?: number;
      }[];
      src: string;
      alt: string;
      caption?: string;
    };

export interface CaseSection {
  id: string;
  no: string;
  /** Short chapter title shown in the upfront 6-chapter overview grid & Top Hub dropdown */
  navLabel: string;
  kicker: string;
  title: string;
  standfirst?: string;
  blocks: Block[];
}

export interface CaseMetaCell {
  label: string;
  value: string;
}

export interface CasePrototypeConfig {
  title: string;
  src: string;
  deepLink?: string;
  scenarios?: { label: string; deepLink: string }[];
}

export interface CaseStudy {
  id: "sentinel" | "lokai" | "feul";
  index: string;
  /** short name used in Top Hub Capsule / next-ramp */
  name: string;
  /** full product name shown in hero & hub */
  fullName: string;
  /** uppercase mono eyebrow above the H1 */
  tagline: string;
  discipline: string;
  /** display title — the story hook */
  title: string;
  /** optional trailing phrase rendered in Instrument Serif italic */
  titleAccent?: string;
  hookLine: string;
  status: string;
  role: string;
  year: string;
  origin: string;
  surface: string;
  build: string;
  /** 4-cell upfront recruiter meta grid */
  metaGrid: CaseMetaCell[];
  /** full prototype modal configuration */
  prototype: CasePrototypeConfig;
  /** the three strongest decisions, highlights-first */
  chips: string[];
  /** mandatory honesty boundary — what is scripted, what was never tested */
  boundary: string;
  heroFigure?: { src: string; alt: string; caption?: string; aspectRatio?: string };
  sections: CaseSection[];
  /** closing thought above the next-case ramp */
  closeLine: string;
  colophon?: string;
}
