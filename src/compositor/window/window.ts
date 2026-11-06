// Published language of the Compositor context (RL-01) and its translation of
// Hyprland toplevels (RL-02).

type Brand<T, B extends string> = T & { readonly __brand: B };
export type Address = Brand<string, "Address">;
export type AppId = Brand<string, "AppId">;
export type WorkspaceId = Brand<number, "WorkspaceId">;

export type WindowState = "Shown" | "Minimized";

export type Window = {
  readonly address: Address;
  readonly appId: AppId;
  readonly title: string;
  readonly state: WindowState;
  // The Workspace the Window is on, or the one it left while Minimized (INV-01).
  readonly workspaceId: WorkspaceId | null;
};

// The part of Quickshell's HyprlandToplevel this context reads.
export type HyprlandToplevel = {
  readonly address: string;
  readonly title: string;
  readonly wayland: { readonly appId: string; readonly parent: unknown } | null;
  readonly workspace: { readonly id: number; readonly name: string } | null;
  readonly lastIpcObject: { readonly tags?: readonly string[] } | null;
};

const MINIMIZED_WORKSPACE = "special:minimized";
const MINIMIZED_FROM = /^omarchy-minimized-from-(\d+)$/;

// Quickshell drops the 0x prefix that hyprctl uses.
export const toAddress = (raw: string): Address => (raw.startsWith("0x") ? raw : "0x" + raw) as Address;

// QML's JS engine has no object spread, so these modules build objects with
// Object.assign; bun build does not lower syntax.

// Dialogs (toplevels with a parent) belong to their app's main Window.
export function toWindow(toplevel: HyprlandToplevel): Window | null {
  const appId = toplevel.wayland?.appId;
  if (!appId || toplevel.wayland?.parent) return null;
  return Object.assign({ address: toAddress(toplevel.address), appId: appId as AppId, title: toplevel.title }, placement(toplevel));
}

function placement(toplevel: HyprlandToplevel): Pick<Window, "state" | "workspaceId"> {
  if (toplevel.workspace?.name === MINIMIZED_WORKSPACE) {
    return { state: "Minimized", workspaceId: minimizedFrom(toplevel.lastIpcObject) };
  }
  return { state: "Shown", workspaceId: (toplevel.workspace?.id ?? null) as WorkspaceId | null };
}

// The tag arrives with Hyprland's next client list, so a fresh Window may lack it.
function minimizedFrom(ipc: HyprlandToplevel["lastIpcObject"]): WorkspaceId | null {
  const match = (ipc?.tags ?? []).map((tag) => MINIMIZED_FROM.exec(tag)).find((m) => m !== null);
  return match ? (Number(match[1]) as WorkspaceId) : null;
}
