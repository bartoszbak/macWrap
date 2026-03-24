"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { toPng } from "html-to-image";

interface CaptureButtonProps {
  captureRef: React.RefObject<HTMLDivElement | null>;
  onBeforeCapture: () => void;
  bgIsDark: boolean;
}

export function CaptureButton({ captureRef, onBeforeCapture, bgIsDark }: CaptureButtonProps) {
  const [capturing, setCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    const el = captureRef.current;
    if (!el || capturing) return;

    // Deselect stickers so control handles don't appear in the screenshot
    onBeforeCapture();

    setCapturing(true);

    // Give React a frame to re-render the deselected state
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    try {
      const dataUrl = await toPng(el, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "macwrap.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Capture failed", err);
    } finally {
      setCapturing(false);
    }
  }, [captureRef, capturing, onBeforeCapture]);

  const fg = bgIsDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)";
  const fgHover = bgIsDark ? "rgba(255,255,255,1)" : "rgba(0,0,0,0.85)";

  return (
    <motion.button
      className="mw-capture-button"
      onClick={handleCapture}
      disabled={capturing}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Download screenshot"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 10,
        background: bgIsDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
        border: `1px solid ${bgIsDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
        color: capturing ? (bgIsDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)") : fg,
        fontSize: 12,
        fontWeight: 500,
        cursor: capturing ? "default" : "pointer",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transition: `color 0.2s, border-color 0.2s`,
      }}
      animate={{ color: capturing ? (bgIsDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)") : fgHover }}
    >
      {/* Camera icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
      {capturing ? "Saving…" : "Save"}
    </motion.button>
  );
}
