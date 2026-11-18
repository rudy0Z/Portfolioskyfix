import { sentinel } from "./sentinel";
import { lokai } from "./lokai";
import { feul } from "./feul";
import type { CaseStudy } from "./types";

export type { CaseStudy, CaseSection, CaseMetaCell, CasePrototypeConfig, Block } from "./types";

export const CASE_STUDIES: Record<string, CaseStudy> = {
  sentinel,
  lokai,
  feul,
};

/** Reading order — the funnel: deep → trust → business → contact. */
export const CASE_ORDER: string[] = ["sentinel", "lokai", "feul"];

export function getCase(id: string): CaseStudy {
  return CASE_STUDIES[id] ?? sentinel;
}
