"use client";

import type { ReactNode } from "react";
import { NavigationNotch } from "./navigation/NavigationNotch";

export interface HeaderProps {
  /** The sky clock, rendered at the right end of the top row. */
  clock?: ReactNode;
  /** Replay the intro bloom — fired by the docked tracking flower. */
  onReplayBloom?: () => void;
}

/**
 * Header — the persistent top navigation bar.
 */
export function Header({ clock, onReplayBloom }: HeaderProps) {
  return <NavigationNotch clock={clock} onReplayBloom={onReplayBloom} />;
}

export { NavigationNotch };
