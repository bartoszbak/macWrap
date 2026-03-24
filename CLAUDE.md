# MacWrap — CLAUDE.md

## Project Overview

**MacWrap** is a web app that lets users design their own MacBook top case (lid) by placing, arranging, and customizing sticker objects on a virtual canvas. It's a creative, tactile design toy — think a digital sticker book meets a hardware customization tool.

---

## Tech Stack

This project **always** uses the following stack. Never deviate from it.

| Layer | Technology |
|---|---|
| Framework | **Next.js** (App Router) |
| UI Components | **shadcn/ui** |
| Animation | **Motion** (`motion/react`, formerly Framer Motion) |
| Styling | **Tailwind CSS** (via shadcn defaults) |
| State | React `useState` / `useRef` (no external store needed) |
| Language | **TypeScript** |

---

## Core User Flow

1. User opens the app
2. A **MacBook lid canvas** is rendered center-screen — a horizontal rounded rectangle representing the top case
3. A **floating toolbar** sits at the bottom of the screen, containing a set of draggable sticker shapes
4. User **drags a sticker** from the toolbar and **drops it onto the lid**
5. Once placed, the user can:
   - **Move** the sticker freely across the lid
   - **Rotate** the sticker (via a rotation handle or gesture)
   - **Remove** the sticker (via a delete affordance on hover/select)
6. User can **toggle lid color** between **Silver** and **Space Gray** using a switch in the UI

---

## Canvas & Lid Specs

- The lid is a **horizontal rounded rectangle** (`border-radius: ~12–16px`) rendered as a `div` or `svg` container
- Aspect ratio: approximately **16:10** (MacBook proportions)
- The lid surface should have a subtle **metallic texture or gradient** reflecting the selected color:
  - **Silver**: light cool gray gradient, slight sheen
  - **Space Gray**: dark neutral gray gradient, matte finish
- The Apple logo area is optional but adds delight if included (centered, subtle embossed effect)
- Stickers are constrained to stay **within the lid bounds** (clipping or boundary logic)

---

## Sticker System

- Stickers are **SVG shape objects** (stars, hearts, arrows, blobs, badges, etc.)
- Each sticker lives in the floating toolbar and can be **dragged** from it onto the lid
- Once on the lid, each sticker is an **independent, interactive element**:
  - Position: absolute, draggable within lid bounds
  - Rotation: handle appears on select, drag to rotate
  - Scale: optional resize handle
  - Delete: `×` button appears on hover or select
- Stickers animate in when placed (scale + fade entrance via Motion)
- Stickers have a **selected state** (subtle ring/glow outline)

---

## UI Components (shadcn)

Use the following shadcn components where appropriate:

- `Toggle` or `Switch` — for Silver / Space Gray color switcher
- `Button` — toolbar actions (clear all, randomize)
- `Tooltip` — label sticker names in toolbar on hover
- `Badge` — sticker count indicator (e.g. "3 stickers")
- `Separator` — toolbar dividers

---

## Animation Guidelines (Motion)

Use `motion/react` for all interactive animation. Key moments:

| Interaction | Animation |
|---|---|
| App load | Lid slides up + fades in (`y: 40 → 0`, `opacity: 0 → 1`) |
| Toolbar load | Sticker icons stagger in from bottom |
| Sticker drop onto lid | Scale bounce (`scale: 0.5 → 1.1 → 1.0`) + fade in |
| Sticker drag | Slight lift shadow + scale up `1.05` while dragging |
| Sticker remove | Scale down + fade out (`scale: 1 → 0`, `opacity: 0`) |
| Lid color switch | Smooth `background` transition over `300ms` |
| Sticker hover | Subtle lift (`y: -2px`) with shadow |

All animations should feel **snappy and physical** — not sluggish or overdone.

---

## File Structure

```
/app
  /page.tsx              ← Root page, renders <LidCanvas /> and <StickerToolbar />
  /layout.tsx            ← Root layout with fonts and metadata

/components
  /lid-canvas.tsx        ← The MacBook lid surface, accepts stickers as state
  /sticker.tsx           ← Individual draggable/rotatable sticker component
  /sticker-toolbar.tsx   ← Floating bottom bar with draggable sticker sources
  /lid-color-toggle.tsx  ← Silver / Space Gray switcher using shadcn Toggle

/lib
  /stickers.ts           ← Sticker definitions (id, label, SVG path/component)
  /types.ts              ← Shared TypeScript types (PlacedSticker, StickerDef, LidColor)

/public
  /stickers/             ← Optional: SVG sticker assets
```

---

## TypeScript Types

```ts
// lib/types.ts

export type LidColor = 'silver' | 'space-gray'

export interface StickerDef {
  id: string
  label: string
  svg: React.FC<React.SVGProps<SVGSVGElement>>
}

export interface PlacedSticker {
  uid: string           // unique instance id
  defId: string         // references StickerDef.id
  x: number             // position on lid (% or px)
  y: number
  rotation: number      // degrees
  scale: number
}
```

---

## Design Direction

- **Aesthetic**: Clean, minimal, hardware-inspired. The lid is the hero.
- **Background**: Near-black or deep neutral — makes the metallic lid pop
- **Typography**: Tight, modern sans-serif (e.g. Geist, DM Sans, or similar)
- **Toolbar**: Frosted glass floating pill at the bottom (`backdrop-blur`, subtle border)
- **Color language**: Let the lid color be the dominant UI variable — everything else recedes

---

## Prompt (for Claude or Cursor)

> Build a Next.js app called **MacWrap** using the App Router, shadcn/ui, Motion (`motion/react`), and Tailwind CSS.
>
> The app renders a MacBook lid canvas — a horizontal rounded rectangle with a metallic finish — centered on screen. A floating toolbar at the bottom contains draggable sticker shape objects (SVG icons like stars, hearts, arrows, badges).
>
> Users can drag stickers from the toolbar and drop them onto the lid. Each placed sticker can be moved, rotated via a handle, and removed with a delete button on hover. Stickers animate in with a bounce scale effect and out with a fade.
>
> A toggle (shadcn `Toggle` or `Switch`) lets the user switch the lid between **Silver** and **Space Gray** finishes, with a smooth color transition.
>
> All animations use Motion (`motion/react`). The stack is always: Next.js (App Router) + shadcn/ui + Motion + Tailwind + TypeScript. Never use a different stack.
>
> Follow the component structure and TypeScript types defined in CLAUDE.md.

---

## Element Naming Convention

Every JSX element must have a `mw-` prefixed `className` that identifies what it is. This makes elements instantly recognisable when reading code or inspecting the DOM.

**Pattern:** `mw-[component]-[element]`

Examples from the codebase:

| Class | Element |
|---|---|
| `mw-page-root` | Root `<main>` in `page.tsx` |
| `mw-page-grid` | Background grid overlay |
| `mw-page-lid-color-controls` | Lid color toggle container |
| `mw-page-bg-color-controls` | Background color toggle container |
| `mw-page-hint` | "Drag stickers…" hint text |
| `mw-lid-wrapper` | Outer wrapper in `lid-canvas.tsx` |
| `mw-lid-body` | Clickable lid surface |
| `mw-lid-sheen` | Metallic sheen overlay |
| `mw-lid-apple-logo` | Apple logo watermark |
| `mw-lid-edge` | Lid edge/depth ring |
| `mw-sticker` | Root element of each placed sticker |
| `mw-sticker-svg` | SVG wrapper inside a sticker |
| `mw-sticker-ring` | Selection ring overlay |
| `mw-sticker-delete` | × delete button |
| `mw-sticker-rotate-handle` | Rotation drag handle |
| `mw-toolbar-wrapper` | Outer motion wrapper |
| `mw-toolbar-pill` | Frosted-glass pill container |
| `mw-toolbar-count` | Sticker count badge |
| `mw-toolbar-divider` | Vertical divider lines |
| `mw-toolbar-item-wrapper` | Per-sticker animation wrapper |
| `mw-toolbar-item` | Draggable sticker button |
| `mw-toolbar-clear-wrapper` | Clear button animation wrapper |
| `mw-lid-color-toggle` | Lid color toggle root |
| `mw-lid-color-option` | Individual lid color button |
| `mw-lid-color-option--silver` | Silver variant modifier |
| `mw-lid-color-option--space-gray` | Space Gray variant modifier |
| `mw-lid-color-check` | Checkmark SVG inside option |
| `mw-bg-color-toggle` | Background color toggle root |
| `mw-bg-color-option` | Individual background color button |
| `mw-bg-color-option--dark` | Dark variant modifier |
| `mw-bg-color-option--light` | Light variant modifier |
| `mw-bg-color-check` | Checkmark SVG inside option |

**Rules:**
- Apply to every element — wrappers, overlays, handles, badges, everything.
- Never omit a `mw-` class to keep elements unidentified.
- When adding new components or elements, define and add an appropriate `mw-` class before writing any other code.
- Modifier classes (`mw-foo--variant`) are added alongside the base class, not instead of it.

---

## Notes

- Always use `motion/react` import (not `framer-motion`)
- Always use shadcn components via `@/components/ui/...`
- The lid canvas should use `position: relative` with stickers as `position: absolute` children
- Drag-and-drop from toolbar to canvas: use pointer events or `useDrag` pattern — not HTML5 native drag API (poor mobile/animation support)
- Keep state flat: a single `placedStickers: PlacedSticker[]` array in the root page or a context
