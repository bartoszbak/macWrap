"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { LidCanvas } from "@/components/lid-canvas";
import { StickerToolbar } from "@/components/sticker-toolbar";
import { LidColorToggle } from "@/components/lid-color-toggle";
import { BgColorToggle } from "@/components/bg-color-toggle";
import { MacSizeToggle } from "@/components/mac-size-toggle";
import { CaptureButton } from "@/components/capture-button";
import type { LidColor, BgColor, MacSize, StickerDef, PlacedSticker } from "@/lib/types";
import { MAC_SIZE_SPECS, lidDimensions } from "@/lib/mac-sizes";

const BG_GRADIENTS: Record<BgColor, string> = {
  dark: "radial-gradient(ellipse at 50% 40%, #16161f 0%, #0a0a0f 70%)",
  light: "#ffffff",
};

const GRID_COLOR: Record<BgColor, string> = {
  dark: "rgba(255,255,255,0.02)",
  light: "rgba(0,0,0,0.04)",
};

let uidCounter = 0;
function generateUid() {
  return `sticker-${++uidCounter}-${Date.now()}`;
}

export default function Home() {
  const [lidColor, setLidColor] = useState<LidColor>("silver");
  const [bgColor, setBgColor] = useState<BgColor>("dark");
  const [macSize, setMacSize] = useState<MacSize>("14");
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stickerDefs, setStickerDefs] = useState<StickerDef[]>([]);
  const lidRef = useRef<HTMLDivElement | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/stickers")
      .then((r) => r.json())
      .then(setStickerDefs)
      .catch(console.error);
  }, []);

  const handleStickerDrop = useCallback(
    (sticker: Omit<PlacedSticker, "uid">) => {
      const newSticker: PlacedSticker = { ...sticker, uid: generateUid() };
      setPlacedStickers((prev) => [...prev, newSticker]);
      setSelectedId(newSticker.uid);
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
  }, []);

  const handleSelect = useCallback((uid: string | null) => {
    setSelectedId(uid);
  }, []);

  const handleMacSizeChange = useCallback((newSize: MacSize) => {
    const oldSpec = MAC_SIZE_SPECS[macSize];
    const newSpec = MAC_SIZE_SPECS[newSize];
    const vw = window.innerWidth;
    const oldWidth = Math.min(vw * oldSpec.vwFactor / 100, oldSpec.maxWidth);
    const newWidth = Math.min(vw * newSpec.vwFactor / 100, newSpec.maxWidth);
    const oldHeight = oldWidth / oldSpec.aspectRatio;
    const newHeight = newWidth / newSpec.aspectRatio;
    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;
    setPlacedStickers((prev) =>
      prev.map((s) => ({ ...s, x: s.x * scaleX, y: s.y * scaleY }))
    );
    setMacSize(newSize);
  }, [macSize]);

  const gridColor = GRID_COLOR[bgColor];
  const lidDims = lidDimensions(MAC_SIZE_SPECS[macSize]);

  return (
    <motion.main
      animate={{ background: BG_GRADIENTS[bgColor] }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="mw-page-root min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Subtle grid background */}
      <div
        className="mw-page-grid"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          transition: "background-image 0.4s",
        }}
      />

      {/* Bottom-right: lid color */}
      <div className="mw-page-lid-color-controls absolute bottom-4 right-4 z-50">
        <LidColorToggle color={lidColor} onChange={setLidColor} />
      </div>

      {/* Bottom-left: background color */}
      <div className="mw-page-bg-color-controls absolute bottom-4 left-4 z-50">
        <BgColorToggle color={bgColor} onChange={setBgColor} />
      </div>

      {/* Top-right: mac size */}
      <div className="mw-page-mac-size-controls absolute top-4 right-4 z-50">
        <MacSizeToggle size={macSize} onChange={handleMacSizeChange} bgIsDark={bgColor === "dark"} />
      </div>

      {/* Top-left: capture */}
      <div className="mw-page-capture-controls absolute top-4 left-4 z-50">
        <CaptureButton
          captureRef={captureRef}
          onBeforeCapture={() => setSelectedId(null)}
          bgIsDark={bgColor === "dark"}
        />
      </div>

      {/* Lid canvas */}
      <LidCanvas
        lidColor={lidColor}
        macSize={macSize}
        stickerDefs={stickerDefs}
        stickers={placedStickers}
        selectedId={selectedId}
        onStickerUpdate={handleStickerUpdate}
        onStickerRemove={handleStickerRemove}
        onStickerSelect={handleSelect}
        onStickerBringForward={handleBringForward}
        onStickerSendBackward={handleSendBackward}
        lidRef={lidRef}
        captureRef={captureRef}
      />

      {/* Hint text */}
      {placedStickers.length === 0 && (
        <p
          className="mw-page-hint absolute text-xs tracking-wide mt-2"
          style={{
            color: bgColor === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)",
            top: `calc(50% + min(${lidDims.halfHeightVw.toFixed(3)}vw, ${lidDims.halfHeightPx.toFixed(1)}px) + 12px)`,
          }}
        >
          Drag stickers from the toolbar below
        </p>
      )}

      {/* Toolbar */}
      <StickerToolbar
        defs={stickerDefs}
        placedCount={placedStickers.length}
        lidRef={lidRef}
        onStickerDrop={handleStickerDrop}
        onClearAll={handleClearAll}
      />
    </motion.main>
  );
}
