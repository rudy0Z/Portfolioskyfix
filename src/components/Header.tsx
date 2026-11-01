"use client";

import { NavigationNotch } from "./navigation/NavigationNotch";

export interface HeaderProps {
  onOpenGarden: () => void;
  isLoaderDocked?: boolean;
}

/**
 * Header — Wraps the top-anchored morphing NavigationNotch with TypeGarden botanical logo,
 * cursor-tracking flower, navigation links, and compact audio player.
 */
export function Header({ onOpenGarden, isLoaderDocked = true }: HeaderProps) {
  return (
    <NavigationNotch
      onOpenGarden={onOpenGarden}
      isLoaderDocked={isLoaderDocked}
    />
  );
}

export { NavigationNotch };
