"use client";

import { motion, AnimatePresence } from "motion/react";
import { Sticker } from "@/components/sticker";
import type { PlacedSticker, StickerDef, LidColor, MacSize } from "@/lib/types";

interface LidCanvasProps {
  lidColor: LidColor;
  macSize: MacSize;
  lidPixelDims: { width: number; height: number };
  stickerDefs: StickerDef[];
  stickers: PlacedSticker[];
  selectedId: string | null;
  onStickerUpdate: (uid: string, updates: Partial<PlacedSticker>) => void;
  onStickerRemove: (uid: string) => void;
  onStickerSelect: (uid: string | null) => void;
  onStickerBringForward: (uid: string) => void;
  onStickerSendBackward: (uid: string) => void;
  onLidClick: () => void;
  lidRef: React.RefObject<HTMLDivElement | null>;
  captureRef: React.RefObject<HTMLDivElement | null>;
}

const LID_GRADIENTS: Record<LidColor, string> = {
  silver:
    "linear-gradient(135deg, #e8eaed 0%, #d0d3d8 20%, #c4c7cc 40%, #d8dadd 60%, #e4e6e9 80%, #cdd0d4 100%)",
  "space-gray":
    "linear-gradient(135deg, #4a4a4f 0%, #3a3a3e 20%, #2e2e32 40%, #3c3c40 60%, #484849 80%, #383838 100%)",
};

const LID_SHEEN: Record<LidColor, string> = {
  silver:
    "linear-gradient(120deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.0) 50%, rgba(255,255,255,0.15) 100%)",
  "space-gray":
    "linear-gradient(120deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.0) 50%, rgba(255,255,255,0.04) 100%)",
};

export function LidCanvas({
  lidColor,
  macSize,
  lidPixelDims,
  stickerDefs,
  stickers,
  selectedId,
  onStickerUpdate,
  onStickerRemove,
  onStickerSelect,
  onStickerBringForward,
  onStickerSendBackward,
  onLidClick,
  lidRef,
  captureRef,
}: LidCanvasProps) {
  const defsById = Object.fromEntries(stickerDefs.map((d) => [d.id, d]));

  return (
    <motion.div
      ref={(el) => { captureRef.current = el; }}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1, width: lidPixelDims.width, height: lidPixelDims.height }}
      transition={{ type: "spring", stiffness: 200, damping: 28 }}
      className="mw-lid-wrapper relative"
      style={{
        width: lidPixelDims.width,
        height: lidPixelDims.height,
      }}
    >
      {/* Lid body — overflow:hidden for visual clipping only */}
      <motion.div
        className="mw-lid-body"
        animate={{ background: LID_GRADIENTS[lidColor] }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "2.5rem",
          overflow: "hidden",
          // @ts-expect-error — cornerShape is a newer CSS property not yet in TypeScript's type definitions
          cornerShape: "superellipse(1.25)",
        }}
      >
        {/* Metallic sheen overlay */}
        <motion.div
          className="mw-lid-sheen"
          animate={{ background: LID_SHEEN[lidColor] }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "2.5rem",
            // @ts-expect-error — cornerShape is a newer CSS property not yet in TypeScript's type definitions
            cornerShape: "superellipse(1.25)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Apple logo watermark */}
        <motion.div
          className="mw-lid-apple-logo"
          animate={{ opacity: 1, width: macSize === "14" ? 80 : 100, height: macSize === "14" ? 98 : 122 }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: macSize === "14" ? 80 : 100,
            height: macSize === "14" ? 98 : 122,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 814 1000"
            width="100%"
            height="100%"
            style={{
              fill: lidColor === "silver" ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.07)",
              filter: lidColor === "silver"
                ? "drop-shadow(0 1px 0 rgba(255,255,255,0.5))"
                : "drop-shadow(0 1px 0 rgba(0,0,0,0.3))",
              transition: "fill 0.4s ease-in-out, filter 0.4s ease-in-out",
            }}
          >
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Sticker layer — auto pointer events so overflowing handles (rotation, delete) are reachable.
          Sticker onPointerDown calls stopPropagation, so empty-area clicks reach this handler. */}
      <div
        ref={lidRef}
        className="mw-lid-stickers-layer"
        onPointerDown={(e) => { e.stopPropagation(); onStickerSelect(null); onLidClick(); }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "2.5rem",
          overflow: "visible",
          pointerEvents: "auto",
          cursor: "default",
        }}
      >
        <AnimatePresence>
          {stickers.map((s, i) => {
            const def = defsById[s.defId];
            if (!def) return null;
            return (
              <Sticker
                key={s.uid}
                sticker={s}
                def={def}
                lidRef={lidRef}
                zOrder={i}
                onUpdate={onStickerUpdate}
                onRemove={onStickerRemove}
                isSelected={selectedId === s.uid}
                onSelect={onStickerSelect}
                onBringForward={onStickerBringForward}
                onSendBackward={onStickerSendBackward}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Lid edge/depth effect */}
      <div
        className="mw-lid-edge"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "2.5rem",
          pointerEvents: "none",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
        }}
      />
    </motion.div>
  );
}
