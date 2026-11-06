import { describe, expect, test } from "bun:test";
import type { Window } from "../window/window";
import { close, focus } from "./dispatch";

const shown = { address: "0xa", appId: "kitty", title: "", state: "Shown", workspaceId: 3 } as Window;

describe("dispatch", () => {
  test("AC-compositor-04 focuses a shown window and raises it", () => {
    expect(focus(shown)).toEqual([
      'hl.dsp.focus({ window = "address:0xa" })',
      'hl.dsp.window.alter_zorder({ mode = "top", window = "address:0xa" })',
    ]);
  });

  test("AC-compositor-05 focus never acts on a minimized window", () => {
    expect(focus({ ...shown, state: "Minimized" })).toEqual([]);
  });

  test("AC-compositor-07 closes a window", () => {
    expect(close(shown)).toEqual(['hl.dsp.window.close({ window = "address:0xa" })']);
  });
});
