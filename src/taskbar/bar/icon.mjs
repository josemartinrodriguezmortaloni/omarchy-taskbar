// src/taskbar/bar/icon.ts
var ALPHA_THRESHOLD = 24;
function iconCrop(rgba, size) {
  const box = opaqueBox(rgba, size);
  const side = Math.max(box.width, box.height);
  return {
    x: centered(box.x, box.width, side, size) / size,
    y: centered(box.y, box.height, side, size) / size,
    side: side / size
  };
}
function centered(start, length, side, size) {
  return Math.min(Math.max(0, Math.round(start - (side - length) / 2)), size - side);
}
function opaqueBox(rgba, size) {
  const pixels = Array.from({ length: size * size }, (_, i) => i).filter((i) => rgba[i * 4 + 3] > ALPHA_THRESHOLD);
  if (pixels.length === 0)
    return { x: 0, y: 0, width: size, height: size };
  const xs = pixels.map((i) => i % size);
  const ys = pixels.map((i) => Math.floor(i / size));
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x + 1, height: Math.max(...ys) - y + 1 };
}
export {
  iconCrop
};
