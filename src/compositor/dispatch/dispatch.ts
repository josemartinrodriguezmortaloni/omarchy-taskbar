// Hyprland Lua dispatch expressions, one per `hyprctl dispatch` call.
import type { Window } from "../window/window";

export type Dispatch = readonly string[];

export const target = (window: Window): string => `window = "address:${window.address}"`;

export function focus(window: Window): Dispatch {
  if (window.state === "Minimized") return []; // INV-02
  return [`hl.dsp.focus({ ${target(window)} })`, `hl.dsp.window.alter_zorder({ mode = "top", ${target(window)} })`];
}

export const close = (window: Window): Dispatch => [`hl.dsp.window.close({ ${target(window)} })`];
