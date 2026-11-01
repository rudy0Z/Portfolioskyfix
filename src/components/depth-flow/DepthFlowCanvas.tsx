"use client";

import type { CSSProperties } from "react";
import { MeadowDepthShader } from "./MeadowDepthShader";
import { RespiteDepthShader } from "./RespiteDepthShader";
import { SavannaDepthShader } from "./SavannaDepthShader";

export type DepthFlowPreset = "meadow" | "respite" | "savanna";

export interface DepthFlowCanvasProps {
  preset?: DepthFlowPreset;
  sceneUrl?: string;
  mapsUrl?: string;
  focus?: [number, number];
  style?: CSSProperties;
  className?: string;
}

export function DepthFlowCanvas({
  preset = "meadow",
  sceneUrl,
  mapsUrl,
  focus = [0.5, 0.5],
  style,
  className = "",
}: DepthFlowCanvasProps) {
  if (preset === "respite") {
    return (
      <RespiteDepthShader
        sceneUrl={sceneUrl}
        mapsUrl={mapsUrl}
        focus={focus}
        style={style}
        className={className}
      />
    );
  }

  if (preset === "savanna") {
    return (
      <SavannaDepthShader
        sceneUrl={sceneUrl}
        mapsUrl={mapsUrl}
        focus={focus}
        style={style}
        className={className}
      />
    );
  }

  return (
    <MeadowDepthShader
      sceneUrl={sceneUrl}
      mapsUrl={mapsUrl}
      focus={focus}
      style={style}
      className={className}
    />
  );
}

export default DepthFlowCanvas;
