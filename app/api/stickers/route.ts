import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DEFAULT_SIZE = { x: 72, y: 72 };

export async function GET() {
  const dir = path.join(process.cwd(), "public/stickers");

  if (!fs.existsSync(dir)) {
    return NextResponse.json([]);
  }

  // Load predefined sizes from sizes.json
  const sizesPath = path.join(dir, "sizes.json");
  let sizeMap: Record<string, { x: number; y: number }> = {};
  if (fs.existsSync(sizesPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(sizesPath, "utf-8"));
      // Strip the _instructions meta key
      const { _instructions: _, ...sizes } = raw;
      sizeMap = sizes;
    } catch {
      // Malformed sizes.json — fall back to defaults
    }
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".svg"))
    .sort();

  const stickers = files.map((file) => {
    const id = file.replace(/\.svg$/i, "");
    const label = id
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const entry = sizeMap[id];
    const size =
      entry && typeof entry.x === "number" && typeof entry.y === "number"
        ? entry
        : DEFAULT_SIZE;
    return { id, label, src: `/stickers/${file}`, size };
  });

  return NextResponse.json(stickers);
}
