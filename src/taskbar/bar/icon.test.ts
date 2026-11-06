import { describe, expect, test } from "bun:test";
import { iconCrop } from "./icon";

// An RGBA buffer of size x size with the given rectangle opaque.
function image(size: number, x: number, y: number, width: number, height: number): number[] {
  const rgba = new Array(size * size * 4).fill(0);
  for (let row = y; row < y + height; row++) {
    for (let col = x; col < x + width; col++) rgba[(row * size + col) * 4 + 3] = 255;
  }
  return rgba;
}

describe("iconCrop", () => {
  test("keeps a full-bleed icon whole", () => {
    expect(iconCrop(image(8, 0, 0, 8, 8), 8)).toEqual({ x: 0, y: 0, side: 1 });
  });

  test("trims an even transparent margin", () => {
    expect(iconCrop(image(8, 2, 2, 4, 4), 8)).toEqual({ x: 0.25, y: 0.25, side: 0.5 });
  });

  test("squares a wide icon around its middle", () => {
    expect(iconCrop(image(8, 1, 3, 6, 2), 8)).toEqual({ x: 0.125, y: 0.25, side: 0.75 });
  });

  test("keeps the square inside the image at an edge", () => {
    expect(iconCrop(image(8, 0, 0, 6, 2), 8)).toEqual({ x: 0, y: 0, side: 0.75 });
  });

  test("ignores faint pixels such as soft shadows", () => {
    const rgba = image(8, 2, 2, 4, 4);
    rgba[3] = 10;
    expect(iconCrop(rgba, 8)).toEqual({ x: 0.25, y: 0.25, side: 0.5 });
  });

  test("keeps a fully transparent icon whole", () => {
    expect(iconCrop(new Array(8 * 8 * 4).fill(0), 8)).toEqual({ x: 0, y: 0, side: 1 });
  });
});
