"use client";

import { useRef, useMemo } from "react";
import { motion } from "motion/react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { StickerDef, PlacedSticker } from "@/lib/types";

interface StickerToolbarProps {
  defs: StickerDef[];
  placedCount: number;
  lidRef: React.RefObject<HTMLDivElement | null>;
  onStickerDrop: (sticker: Omit<PlacedSticker, "uid">) => void;
  onClearAll: () => void;
}

export function StickerToolbar({
  defs,
  placedCount,
  lidRef,
  onStickerDrop,
  onClearAll,
}: StickerToolbarProps) {
  const draggingDef = useRef<StickerDef | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  // Stable random rotations per sticker (10–45°, alternating sign)
  const rotations = useMemo(
    () => defs.map((_, i) => {
      const angle = 4 + Math.random() * 12;
      return i % 2 === 0 ? angle : -angle;
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defs.length]
  );

  const handleDragStart = (def: StickerDef, e: React.PointerEvent) => {
    draggingDef.current = def;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    // Create ghost element sized to match the sticker's predefined size
    const ghost = document.createElement("div");
    ghost.style.cssText = `
      position: fixed;
      width: ${def.size.x}px;
      height: ${def.size.y}px;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%) scale(1.1);
      opacity: 0.9;
      filter: drop-shadow(0 8px 24px rgba(0,0,0,0.6));
    `;
    const img = document.createElement("img");
    img.src = def.src;
    img.alt = def.label;
    img.style.cssText = `width: ${def.size.x}px; height: ${def.size.y}px; display: block;`;
    ghost.appendChild(img);
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    ghost.style.left = e.clientX + "px";
    ghost.style.top = e.clientY + "px";
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!draggingDef.current || !ghostRef.current) return;
    ghostRef.current.style.left = e.clientX + "px";
    ghostRef.current.style.top = e.clientY + "px";
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    if (!draggingDef.current) return;

    // Clean up ghost
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }

    // Check if dropped on lid
    const lid = lidRef.current;
    if (!lid) {
      draggingDef.current = null;
      return;
    }

    const rect = lid.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    if (rawX >= 0 && rawX <= rect.width && rawY >= 0 && rawY <= rect.height) {
      const halfX = draggingDef.current.size.x / 2;
      const halfY = draggingDef.current.size.y / 2;
      const x = Math.max(halfX, Math.min(rect.width - halfX, rawX));
      const y = Math.max(halfY, Math.min(rect.height - halfY, rawY));
      onStickerDrop({
        defId: draggingDef.current.id,
        x,
        y,
        rotation: 0,
        scale: 1,
      });
    }

    draggingDef.current = null;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.3 }}
        className="mw-toolbar-wrapper fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div
          className="mw-toolbar-pill flex items-center gap-2 px-4 py-3 rounded-2xl"
        >
          {/* Sticker count badge — hidden when empty */}
          {placedCount > 0 && (
            <>
              <div
                className="mw-toolbar-count text-xs font-medium px-2 py-0.5 rounded-full mr-1"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "#e0e0e0",
                }}
              >
                {placedCount} {placedCount === 1 ? "sticker" : "stickers"}
              </div>

              {/* Divider */}
              <div className="mw-toolbar-divider w-px h-6 bg-white/10 mx-1" />
            </>
          )}

          {/* Sticker items */}
          {defs.map((def, i) => (
            <motion.div
              key={def.id}
              className="mw-toolbar-item-wrapper"
              style={{ marginLeft: i === 0 ? 0 : -16, zIndex: i }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: 0.35 + i * 0.05,
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="mw-toolbar-item cursor-grab active:cursor-grabbing"
                    style={{
                      width: def.size.x * 0.75,
                      height: def.size.y * 0.75,
                      rotate: rotations[i],
                      touchAction: "none",
                    }}
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onPointerDown={(e) => handleDragStart(def, e)}
                    onPointerMove={handleDragMove}
                    onPointerUp={handleDragEnd}
                    onPointerCancel={handleDragEnd}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={def.src}
                      alt={def.label}
                      width={def.size.x * 0.75}
                      height={def.size.y * 0.75}
                      style={{
                        display: "block",
                        pointerEvents: "none",
                        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
                      }}
                    />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">{def.label}</TooltipContent>
              </Tooltip>
            </motion.div>
          ))}

          {/* Divider */}
          <div className="mw-toolbar-divider w-px h-6 bg-white/10 mx-1" />

          {/* Clear button */}
          <motion.div
            className="mw-toolbar-clear-wrapper"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 + defs.length * 0.05 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              disabled={placedCount === 0}
              className="text-xs"
            >
              Clear
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
