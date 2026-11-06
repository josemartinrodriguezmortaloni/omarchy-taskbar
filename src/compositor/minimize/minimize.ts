// Omarchy's minimize convention: special:minimized plus a minimized-from tag,
// owned by omarchy-hyprland-window-minimize.
import type { Window, WorkspaceId } from "../window/window";
import { type Dispatch, focus, target } from "../dispatch/dispatch";

export const minimize = (window: Window): readonly string[] => ["omarchy-hyprland-window-minimize", window.address];

// Same steps as the Omarchy dock: move to the Workspace, then focus and raise.
export const restore = (window: Window, to: WorkspaceId): Dispatch => [
  `hl.dsp.window.move({ workspace = "${to}", ${target(window)} })`,
  ...focus(Object.assign({}, window, { state: "Shown" as const, workspaceId: to })),
];
