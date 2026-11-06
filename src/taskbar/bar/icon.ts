// Icon themes draw app icons with different transparent margins, so at one bar
// size some look small. Each icon shows the square around its opaque pixels.

// Fractions of the icon's width, so the crop holds at any drawn size.
export type IconCrop = { readonly x: number; readonly y: number; readonly side: number };

type Box = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

// Antialiased edges and faint shadows stay outside the crop.
const ALPHA_THRESHOLD = 24;

// `rgba` is the getImageData() buffer of the icon drawn at size x size.
export function iconCrop(rgba: ArrayLike<number>, size: number): IconCrop {
  const box = opaqueBox(rgba, size);
  const side = Math.max(box.width, box.height);
  return {
    x: centered(box.x, box.width, side, size) / size,
    y: centered(box.y, box.height, side, size) / size,
    side: side / size,
  };
}

// Grows the short side of the box evenly on both ends, inside the image.
function centered(start: number, length: number, side: number, size: number): number {
  return Math.min(Math.max(0, Math.round(start - (side - length) / 2)), size - side);
}

function opaqueBox(rgba: ArrayLike<number>, size: number): Box {
  const pixels = Array.from({ length: size * size }, (_, i) => i).filter((i) => rgba[i * 4 + 3] > ALPHA_THRESHOLD);
  if (pixels.length === 0) return { x: 0, y: 0, width: size, height: size };
  const xs = pixels.map((i) => i % size);
  const ys = pixels.map((i) => Math.floor(i / size));
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x + 1, height: Math.max(...ys) - y + 1 };
}
