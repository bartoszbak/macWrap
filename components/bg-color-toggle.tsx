"use client";

import { motion, AnimatePresence } from "motion/react";
import type { BgColor } from "@/lib/types";

interface BgColorToggleProps {
  color: BgColor;
  onChange: (color: BgColor) => void;
}

const OPTIONS: { value: BgColor; label: string; bg: string; border: string; check: string }[] = [
  {
    value: "dark",
    label: "Dark background",
    bg: "linear-gradient(135deg, #1a1a1f, #0a0a0f)",
    border: "rgba(255,255,255,0.15)",
    check: "#fff",
  },
  {
    value: "light",
    label: "Light background",
    bg: "linear-gradient(135deg, #ffffff, #e8e8e8)",
    border: "rgba(0,0,0,0.15)",
    check: "#222",
  },
];

export function BgColorToggle({ color, onChange }: BgColorToggleProps) {
  return (
    <div className="mw-bg-color-toggle flex items-center gap-2">
      {OPTIONS.map((opt) => {
        const selected = color === opt.value;
        return (
          <motion.button
            key={opt.value}
            className={`mw-bg-color-option mw-bg-color-option--${opt.value}`}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: opt.bg,
              border: `2px solid ${selected ? (opt.value === "light" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.8)") : opt.border}`,
              boxShadow: selected
                ? "0 0 0 1px rgba(128,128,128,0.3), 0 2px 8px rgba(0,0,0,0.4)"
                : "0 2px 6px rgba(0,0,0,0.3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border 0.2s, box-shadow 0.2s",
            }}
          >
            <AnimatePresence>
              {selected && (
                <motion.svg
                  key="check"
                  className="mw-bg-color-check"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                >
                  <path
                    d="M2 6.5L5 9.5L11 3.5"
                    stroke={opt.check}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
