import type { MacSize } from "./types";

export interface MacSizeSpec {
  label: string;
  /** Max lid width in px */
  maxWidth: number;
  /** Lid width as vw (so it scales with viewport) */
  vwFactor: number;
  /** width / height — based on actual display resolution */
  aspectRatio: number;
}

// MacBook Pro 14": 3024 × 1964 display → 1.5407:1
// MacBook Pro 16": 3456 × 2234 display → 1.5470:1
export const MAC_SIZE_SPECS: Record<MacSize, MacSizeSpec> = {
  "14": { label: '14"', maxWidth: 720, vwFactor: 60, aspectRatio: 3024 / 1964 },
  "16": { label: '16"', maxWidth: 900, vwFactor: 75, aspectRatio: 3456 / 2234 },
};

export function computeLidPixelDims(spec: MacSizeSpec) {
  const width = Math.min(window.innerWidth * spec.vwFactor / 100, spec.maxWidth);
  return { width, height: width / spec.aspectRatio };
}

export function lidDimensions(spec: MacSizeSpec) {
  const maxHeight = spec.maxWidth / spec.aspectRatio;
  const vhFactor = spec.vwFactor / spec.aspectRatio;
  return {
    width: `min(${spec.vwFactor}vw, ${spec.maxWidth}px)`,
    height: `min(${vhFactor.toFixed(3)}vw, ${maxHeight.toFixed(1)}px)`,
    /** Half-height values for hint text positioning */
    halfHeightVw: vhFactor / 2,
    halfHeightPx: maxHeight / 2,
  };
}
