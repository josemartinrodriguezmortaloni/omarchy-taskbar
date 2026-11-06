// Which Windows show on the bar and what a click on them asks for.
import type { Address, AppId, Window, WorkspaceId } from "../../compositor/window/window";

export type AppGroup = { readonly appId: AppId; readonly windows: readonly Window[] };

export type ClickIntent =
  | { readonly kind: "choose" }
  | { readonly kind: "focus" | "minimize" | "restore" | "close"; readonly window: Window };

// Shown on the active Workspace, or Minimized from it.
const belongsHere = (window: Window, active: WorkspaceId): boolean => window.workspaceId === active;

// Grouped by App Id in the order Hyprland lists the Windows (INV-01).
export function workspaceApps(windows: readonly Window[], active: WorkspaceId): AppGroup[] {
  const here = windows.filter((window) => belongsHere(window, active));
  const appIds = [...new Set(here.map((window) => window.appId))];
  return appIds.map((appId) => ({ appId, windows: here.filter((window) => window.appId === appId) }));
}

// INV-02: several Windows ask to choose, never for a window action.
export function clickIntent(group: AppGroup, focused: Address | null): ClickIntent {
  if (group.windows.length > 1) return { kind: "choose" };
  return windowIntent(group.windows[0], focused);
}

export function windowIntent(window: Window, focused: Address | null): ClickIntent {
  if (window.state === "Minimized") return { kind: "restore", window };
  return { kind: window.address === focused ? "minimize" : "focus", window };
}

export function middleClickIntent(group: AppGroup): ClickIntent {
  if (group.windows.length > 1) return { kind: "choose" };
  return { kind: "close", window: group.windows[0] };
}
