import { describe, expect, test } from "bun:test";
import type { Address, Window, WorkspaceId } from "../../compositor/window/window";
import { type AppGroup, clickIntent, middleClickIntent, workspaceApps } from "./model";

const win = (address: string, appId: string, state: "Shown" | "Minimized", workspaceId: number): Window =>
  ({ address, appId, title: address, state, workspaceId }) as Window;
const group = (...windows: Window[]): AppGroup => ({ appId: windows[0].appId, windows });
const ws3 = 3 as WorkspaceId;

const kittyShown = win("0xa", "kitty", "Shown", 3);
const zen = win("0xb", "zen", "Shown", 4);
const kittyMin = win("0xc", "kitty", "Minimized", 3);
const obsidian = win("0xd", "obsidian", "Minimized", 4);

describe("workspaceApps", () => {
  test("AC-taskbar-01 shows only the apps of the active workspace", () => {
    expect(workspaceApps([kittyShown, zen, kittyMin, obsidian], ws3)).toEqual([group(kittyShown, kittyMin)]);
  });

  test("keeps the order Hyprland lists the apps in", () => {
    const zen3 = win("0xe", "zen", "Shown", 3);
    expect(workspaceApps([zen3, kittyShown], ws3).map((g) => String(g.appId))).toEqual(["zen", "kitty"]);
  });
});

describe("clickIntent", () => {
  test("AC-taskbar-02 a click on an app with several windows asks to choose", () => {
    expect(clickIntent(group(kittyShown, kittyMin), null)).toEqual({ kind: "choose" });
  });

  test("AC-taskbar-03 a click on the focused window minimizes it", () => {
    expect(clickIntent(group(zen), "0xb" as Address)).toEqual({ kind: "minimize", window: zen });
  });

  test("AC-taskbar-04 a click on a minimized window restores it", () => {
    const obsidian3 = win("0xd", "obsidian", "Minimized", 3);
    expect(clickIntent(group(obsidian3), null)).toEqual({ kind: "restore", window: obsidian3 });
  });

  test("AC-taskbar-05 a click on a window without focus focuses it", () => {
    expect(clickIntent(group(zen), "0xa" as Address)).toEqual({ kind: "focus", window: zen });
  });
});

describe("middleClickIntent", () => {
  test("closes the only window of an app", () => {
    expect(middleClickIntent(group(zen))).toEqual({ kind: "close", window: zen });
  });

  test("asks to choose when the app has several windows", () => {
    expect(middleClickIntent(group(kittyShown, kittyMin))).toEqual({ kind: "choose" });
  });
});
