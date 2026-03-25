"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import type { PlacedSticker, StickerDef } from "@/lib/types";

interface StickerProps {
  sticker: PlacedSticker;
  def: StickerDef;
  lidRef: React.RefObject<HTMLDivElement | null>;
  zOrder: number;
  onUpdate: (uid: string, updates: Partial<PlacedSticker>) => void;
  onRemove: (uid: string) => void;
  isSelected: boolean;
  onSelect: (uid: string) => void;
  onBringForward: (uid: string) => void;
  onSendBackward: (uid: string) => void;
}

const EDGE_INSET = 0;

export function Sticker({
  sticker,
  def,
  lidRef,
  zOrder,
  onUpdate,
  onRemove,
  isSelected,
  onSelect,
  onBringForward,
  onSendBackward,
}: StickerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<{ mouseX: number; mouseY: number; stickerX: number; stickerY: number } | null>(null);
  const rotateRef = useRef<{ startAngle: number; startRotation: number } | null>(null);

  const getStickerCenter = useCallback(() => {
    const lid = lidRef.current;
    if (!lid) return null;
    const rect = lid.getBoundingClientRect();
    return { x: rect.left + sticker.x * rect.width, y: rect.top + sticker.y * rect.height };
  }, [lidRef, sticker.x, sticker.y]);

  const clampPosition = useCallback(
    (x: number, y: number) => {
      const lid = lidRef.current;
      if (!lid) return { x, y };
      const { width: lidW, height: lidH } = lid.getBoundingClientRect();
      const w = (def.size.x * sticker.scale) / 2;
      const h = (def.size.y * sticker.scale) / 2;
      const rad = (sticker.rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      // rotated bounding box half-extents in px, converted to fractions
      const hxFrac = (w * cos + h * sin) / lidW;
      const hyFrac = (w * sin + h * cos) / lidH;
      return {
        x: Math.max(EDGE_INSET + hxFrac, Math.min(1 - EDGE_INSET - hxFrac, x)),
        y: Math.max(EDGE_INSET + hyFrac, Math.min(1 - EDGE_INSET - hyFrac, y)),
      };
    },
    [lidRef, def.size.x, def.size.y, sticker.scale, sticker.rotation]
  );

  // ── Drag ────────────────────────────────────────────────────────────────────

  const handleDragPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      onSelect(sticker.uid);
      dragRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        stickerX: sticker.x,
        stickerY: sticker.y,
      };
    },
    [sticker.uid, sticker.x, sticker.y, onSelect]
  );

  const handleDragPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const lid = lidRef.current;
      if (!lid) return;
      const { width: lidW, height: lidH } = lid.getBoundingClientRect();
      const clamped = clampPosition(
        dragRef.current.stickerX + (e.clientX - dragRef.current.mouseX) / lidW,
        dragRef.current.stickerY + (e.clientY - dragRef.current.mouseY) / lidH
      );
      onUpdate(sticker.uid, clamped);
    },
    [sticker.uid, lidRef, clampPosition, onUpdate]
  );

  const handleDragPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // ── Rotate — window-level listeners bypass all React/Motion event issues ───

  const handleRotatePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const center = getStickerCenter();
      if (!center) return;

      const startAngle =
        Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
      const startRotation = sticker.rotation;
      rotateRef.current = { startAngle, startRotation };

      const uid = sticker.uid;

      const onMove = (ev: PointerEvent) => {
        const c = getStickerCenter();
        if (!c || !rotateRef.current) return;
        const angle = Math.atan2(ev.clientY - c.y, ev.clientX - c.x) * (180 / Math.PI);
        onUpdate(uid, {
          rotation: rotateRef.current.startRotation + (angle - rotateRef.current.startAngle),
        });
      };

      const onUp = () => {
        rotateRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [sticker.uid, sticker.rotation, getStickerCenter, onUpdate]
  );

  const showControls = isHovered || isSelected;
  const width = def.size.x * sticker.scale;
  const height = def.size.y * sticker.scale;

  return (
    <motion.div
      className="mw-sticker"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 22, opacity: { duration: 0.15 } }}
      style={{
        position: "absolute",
        left: `${sticker.x * 100}%`,
        top: `${sticker.y * 100}%`,
        width,
        height,
        x: "-50%",
        y: "-50%",
        rotate: sticker.rotation,
        touchAction: "none",
        pointerEvents: "auto",
        zIndex: isSelected ? 1000 : zOrder + 1,
      }}
      onPointerDown={handleDragPointerDown}
      onPointerMove={handleDragPointerMove}
      onPointerUp={handleDragPointerUp}
      onPointerCancel={handleDragPointerUp}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Sticker image */}
      <motion.div
        style={{ width: "100%", height: "100%", position: "relative" }}
        animate={{
          y: isHovered && !dragRef.current ? -2 : 0,
          filter: isHovered
            ? "drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
            : "drop-shadow(rgba(0, 0, 0, 0.05) 0px 4px 2px)",
        }}
        transition={{ duration: 0.15 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={def.src}
          alt={def.label}
          width="100%"
          height="100%"
          style={{ display: "block", pointerEvents: "none" }}
        />
      </motion.div>


      {/* Delete button */}
      <AnimatePresence>
        {showControls && (
          <motion.button
            key="delete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#ff3b3b",
              border: "2px solid rgba(255,255,255,0.8)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1,
              cursor: "pointer",
              zIndex: 20,
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(sticker.uid);
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={12} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Layer order buttons */}
      <AnimatePresence>
        {isSelected && (
          <>
            <motion.button
              key="layer-up"
              className="mw-sticker-layer-up"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "absolute",
                top: -10,
                left: -10,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.92)",
                border: "2px solid rgba(0,0,0,0.15)",
                color: "#333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
                cursor: "pointer",
                zIndex: 20,
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onBringForward(sticker.uid); }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUp size={12} strokeWidth={2.5} />
            </motion.button>
            <motion.button
              key="layer-down"
              className="mw-sticker-layer-down"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "absolute",
                top: 14,
                left: -10,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.92)",
                border: "2px solid rgba(0,0,0,0.15)",
                color: "#333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
                cursor: "pointer",
                zIndex: 20,
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onSendBackward(sticker.uid); }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowDown size={12} strokeWidth={2.5} />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Rotation handle */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="rotate"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.12 }}
            whileHover={{ scale: 1.3 }}
            style={{
              position: "absolute",
              bottom: -20,
              left: "50%",
              translateX: "-50%",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "white",
              border: "2px solid rgba(0,0,0,0.3)",
              cursor: "grab",
              zIndex: 20,
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              touchAction: "none",
            }}
            onPointerDown={handleRotatePointerDown}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
