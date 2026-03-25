"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LidCanvas } from "@/components/lid-canvas";
import { StickerToolbar } from "@/components/sticker-toolbar";
import { LidColorToggle } from "@/components/lid-color-toggle";
import { BgColorToggle } from "@/components/bg-color-toggle";
import { MacSizeToggle } from "@/components/mac-size-toggle";
import { CaptureButton } from "@/components/capture-button";
import type { LidColor, BgColor, MacSize, StickerDef, PlacedSticker } from "@/lib/types";
import { MAC_SIZE_SPECS, lidDimensions, computeLidPixelDims } from "@/lib/mac-sizes";

const BG_GRADIENTS: Record<BgColor, string> = {
  dark: "radial-gradient(ellipse at 50% 40%, #16161f 0%, #0a0a0f 70%)",
  light: "#ffffff",
};

const GRID_COLOR: Record<BgColor, string> = {
  dark: "rgba(255,255,255,0.02)",
  light: "rgba(0,0,0,0.04)",
};

const STORAGE_KEY = "macwrap-stickers-v2";

let uidCounter = 0;
function generateUid() {
  return `sticker-${++uidCounter}-${Date.now()}`;
}

function loadStickers(): PlacedSticker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlacedSticker[]) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [lidColor, setLidColor] = useState<LidColor>("silver");
  const [bgColor, setBgColor] = useState<BgColor>("dark");
  const [macSize, setMacSize] = useState<MacSize>("14");
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>(() => loadStickers());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lidSelected, setLidSelected] = useState(false);
  const [stickerDefs, setStickerDefs] = useState<StickerDef[]>([]);
  const lidRef = useRef<HTMLDivElement | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/stickers")
      .then((r) => r.json())
      .then(setStickerDefs)
      .catch(console.error);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(placedStickers));
    } catch {
      // storage full or unavailable
    }
  }, [placedStickers]);

  const handleStickerDrop = useCallback(
    (sticker: Omit<PlacedSticker, "uid">) => {
      const newSticker: PlacedSticker = { ...sticker, uid: generateUid() };
      setPlacedStickers((prev) => [...prev, newSticker]);
      setSelectedId(newSticker.uid);
      setLidSelected(false);
    },
    []
  );

  const handleStickerUpdate = useCallback(
    (uid: string, updates: Partial<PlacedSticker>) => {
      setPlacedStickers((prev) =>
        prev.map((s) => (s.uid === uid ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const handleStickerRemove = useCallback((uid: string) => {
    setPlacedStickers((prev) => prev.filter((s) => s.uid !== uid));
    setSelectedId((id) => (id === uid ? null : id));
  }, []);

  const handleBringForward = useCallback((uid: string) => {
    setPlacedStickers((prev) => {
      const idx = prev.findIndex((s) => s.uid === uid);
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const handleSendBackward = useCallback((uid: string) => {
    setPlacedStickers((prev) => {
      const idx = prev.findIndex((s) => s.uid === uid);
      if (idx === 0) return prev;
      const next = [...prev];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setPlacedStickers([]);
    setSelectedId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleSelect = useCallback((uid: string | null) => {
    setSelectedId(uid);
    if (uid !== null) setLidSelected(false);
  }, []);

  const handleLidClick = useCallback(() => {
    setLidSelected(true);
    setSelectedId(null);
  }, []);

  const handleMacSizeChange = useCallback((newSize: MacSize) => {
    setMacSize(newSize);
  }, []);

  const [lidPx, setLidPx] = useState(() => computeLidPixelDims(MAC_SIZE_SPECS[macSize]));

  useLayoutEffect(() => {
    const update = () => setLidPx(computeLidPixelDims(MAC_SIZE_SPECS[macSize]));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [macSize]);

  const gridColor = GRID_COLOR[bgColor];
  const isDark = bgColor === "dark";
  const dims = lidDimensions(MAC_SIZE_SPECS[macSize]);
  const pillBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const pillBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const dividerColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  return (
    <motion.main
      animate={{ background: BG_GRADIENTS[bgColor] }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="mw-page-root min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      onPointerDown={() => setLidSelected(false)}
    >
      {/* Dotted grid background */}
      <div
        className="mw-page-grid"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${gridColor} 1.5px, transparent 1.5px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          transition: "background-image 0.4s",
        }}
      />

      {/* Top bar: Save + BgColor + Wipe */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
        className="mw-page-top-bar fixed top-4 left-1/2 -translate-x-1/2 z-50"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-2xl"
          style={{
            background: pillBg,
            border: `1px solid ${pillBorder}`,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <CaptureButton
            captureRef={captureRef}
            onBeforeCapture={() => setSelectedId(null)}
            bgIsDark={isDark}
          />
          <div className="mw-toolbar-divider w-px h-5 mx-1" style={{ background: dividerColor }} />
          <BgColorToggle color={bgColor} onChange={setBgColor} />
          <AnimatePresence>
            {placedStickers.length > 0 && (
              <motion.div
                key="wipe"
                className="mw-page-top-wipe flex items-center gap-2"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div className="mw-toolbar-divider w-px h-5 mx-1" style={{ background: dividerColor }} />
                <motion.button
                  className="mw-page-wipe-button"
                  onClick={handleClearAll}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "4px 2px",
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                >
                  Wipe
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Lid + absolutely-anchored controls */}
      <motion.div
        className="mw-page-lid-section relative"
        animate={{ width: lidPx.width, height: lidPx.height }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <LidCanvas
          lidColor={lidColor}
          macSize={macSize}
          lidPixelDims={lidPx}
          stickerDefs={stickerDefs}
          stickers={placedStickers}
          selectedId={selectedId}
          onStickerUpdate={handleStickerUpdate}
          onStickerRemove={handleStickerRemove}
          onStickerSelect={handleSelect}
          onStickerBringForward={handleBringForward}
          onStickerSendBackward={handleSendBackward}
          onLidClick={handleLidClick}
          lidRef={lidRef}
          captureRef={captureRef}
        />

        <AnimatePresence>
          {lidSelected && (
            <motion.div
              key="lid-controls"
              className="mw-page-lid-controls absolute left-1/2 flex items-center gap-3 px-4 py-2 rounded-2xl"
              style={{
                top: "calc(100% + 12px)",
                translateX: "-50%",
                whiteSpace: "nowrap",
                background: pillBg,
                border: `1px solid ${pillBorder}`,
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <LidColorToggle color={lidColor} onChange={setLidColor} />
              <div className="mw-toolbar-divider w-px h-5" style={{ background: dividerColor }} />
              <MacSizeToggle size={macSize} onChange={handleMacSizeChange} bgIsDark={isDark} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hint text */}
      {placedStickers.length === 0 && (
        <p
          className="mw-page-hint absolute text-xs tracking-wide"
          style={{
            color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)",
            top: `calc(50% + ${(lidPx.height / 2).toFixed(1)}px + 12px)`,
          }}
        >
          Drag stickers from the toolbar below
        </p>
      )}

      {/* Toolbar */}
      <StickerToolbar
        defs={stickerDefs}
        lidRef={lidRef}
        onStickerDrop={handleStickerDrop}
      />
    </motion.main>
  );
}
