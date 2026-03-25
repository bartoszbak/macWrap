"use client";

import { motion, AnimatePresence } from "motion/react";
import type { LidColor } from "@/lib/types";

interface LidColorToggleProps {
  color: LidColor;
  onChange: (color: LidColor) => void;
}

const OPTIONS: { value: LidColor; label: string; bg: string; border: string }[] = [
  {
    value: "silver",
    label: "Silver",
    bg: "linear-gradient(135deg, #e8eaed, #c4c7cc)",
    border: "rgba(255,255,255,0.4)",
  },
  {
    value: "space-gray",
    label: "Space Gray",
    bg: "linear-gradient(135deg, #4a4a4f, #2e2e32)",
    border: "rgba(255,255,255,0.15)",
  },
];

export function LidColorToggle({ color, onChange }: LidColorToggleProps) {
  return (
    <div className="mw-lid-color-toggle flex items-center gap-2">
      {OPTIONS.map((opt) => {
        const selected = color === opt.value;
        return (
          <motion.button
            key={opt.value}
            className={`mw-lid-color-option mw-lid-color-option--${opt.value}`}
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
                  className="mw-lid-color-check"
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
                    stroke={opt.value === "silver" ? "#222" : "#fff"}
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
