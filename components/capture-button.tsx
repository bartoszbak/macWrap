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

  const fg = bgIsDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const fgHover = bgIsDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)";
  const fgDisabled = bgIsDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";

  return (
    <motion.button
      className="mw-capture-button"
      onClick={handleCapture}
      disabled={capturing}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Download screenshot"
      animate={{ color: capturing ? fgDisabled : fgHover }}
      style={{
        background: "none",
        border: "none",
        padding: "4px 2px",
        color: capturing ? fgDisabled : fg,
        fontSize: 12,
        fontWeight: 500,
        cursor: capturing ? "default" : "pointer",
        transition: "color 0.2s",
      }}
    >
      {capturing ? "Saving…" : "Save"}
    </motion.button>
  );
}
