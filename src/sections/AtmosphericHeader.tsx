"use client";

/**
 * AtmosphericHeader — in-page section opener that inherits the living sky.
 *
 * Unlike the prototype (which had its own phase-keyed band), this version is
 * transparent: it sits on the same fixed sky so there is no seam between the
 * header and the page. It contributes type and a hairline, nothing more.
 */

import type React from "react";

interface AtmosphericHeaderProps {
  title: React.ReactNode;
  kicker?: string;
  breadcrumb?: React.ReactNode;
  children?: React.ReactNode;
  id?: string;
}

export function AtmosphericHeader({
  title,
  kicker,
  breadcrumb,
  children,
  id,
}: AtmosphericHeaderProps) {
  return (
    <header data-hud-section={typeof title === "string" ? title : undefined} id={id} className="atmo-header">
      <div className="atmo-rule" aria-hidden />
      <div className="atmo-inner">
        {breadcrumb && <nav className="atmo-crumb">{breadcrumb}</nav>}
        {kicker && <p className="atmo-kicker">{kicker}</p>}
        <h1 className="atmo-title">{title}</h1>
        {children && <div className="atmo-body">{children}</div>}
      </div>
    </header>
  );
}
