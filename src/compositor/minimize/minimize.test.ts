import { describe, expect, test } from "bun:test";
import type { Window, WorkspaceId } from "../window/window";
import { minimize, restore } from "./minimize";

const window = { address: "0xa", appId: "kitty", title: "", state: "Shown", workspaceId: 3 } as Window;

describe("minimize", () => {
  test("AC-compositor-06 minimizes through Omarchy", () => {
    expect(minimize(window)).toEqual(["omarchy-hyprland-window-minimize", "0xa"]);
  });

  test("AC-compositor-03 restores to the workspace, then focuses and raises", () => {
    expect(restore({ ...window, state: "Minimized" }, 3 as WorkspaceId)).toEqual([
      'hl.dsp.window.move({ workspace = "3", window = "address:0xa" })',
      'hl.dsp.focus({ window = "address:0xa" })',
      'hl.dsp.window.alter_zorder({ mode = "top", window = "address:0xa" })',
    ]);
  });
});
