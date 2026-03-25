"use client";

import { motion } from "motion/react";
import type { MacSize } from "@/lib/types";
import { MAC_SIZE_SPECS } from "@/lib/mac-sizes";

interface MacSizeToggleProps {
  size: MacSize;
  onChange: (size: MacSize) => void;
  bgIsDark: boolean;
}

const SIZES: MacSize[] = ["14", "16"];

export function MacSizeToggle({ size, onChange, bgIsDark }: MacSizeToggleProps) {
  const textColor = bgIsDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const textColorActive = bgIsDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
  const activeBg = bgIsDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  return (
    <div className="mw-mac-size-toggle flex items-center gap-0.5">
      {SIZES.map((s) => {
        const selected = size === s;
        return (
          <motion.button
            key={s}
            className={`mw-mac-size-option mw-mac-size-option--${s}`}
            onClick={() => onChange(s)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: "relative",
              padding: "3px 10px",
              borderRadius: "999px",
              fontSize: 11,
              fontWeight: selected ? 600 : 400,
              letterSpacing: "0.02em",
              color: selected ? textColorActive : textColor,
              background: selected ? activeBg : "transparent",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s, background 0.15s",
            }}
            aria-label={MAC_SIZE_SPECS[s].label}
            aria-pressed={selected}
          >
            {MAC_SIZE_SPECS[s].label}
          </motion.button>
        );
      })}
    </div>
  );
}
