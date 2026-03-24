export type LidColor = "silver" | "space-gray";

export type MacSize = "14" | "16";

export type BgColor = "dark" | "light";

export interface StickerDef {
  id: string;
  label: string;
  src: string; // URL path to SVG in /public/stickers/
  size: { x: number; y: number }; // default rendered width/height in px (from public/stickers/sizes.json)
}

export interface PlacedSticker {
  uid: string;
  defId: string;
  x: number; // px from lid left
  y: number; // px from lid top
  rotation: number; // degrees
  scale: number;
}
