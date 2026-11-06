import { describe, expect, test } from "bun:test";
import { type Address, type HyprlandToplevel, type Window, toWindow } from "./window";

const toplevel = (overrides: Partial<HyprlandToplevel> = {}): HyprlandToplevel => ({
  address: "a",
  title: "shell",
  wayland: { appId: "kitty", parent: null },
  workspace: { id: 3, name: "3" },
  lastIpcObject: { tags: [] },
  ...overrides,
});

describe("toWindow", () => {
  test("AC-compositor-01 reads a shown window", () => {
    expect(toWindow(toplevel())).toEqual({ address: "0xa", appId: "kitty", title: "shell", state: "Shown", workspaceId: 3 } as Window);
  });

  test("AC-compositor-02 reads a minimized window with the workspace it left", () => {
    const window = toWindow(toplevel({
      workspace: { id: -98, name: "special:minimized" },
      lastIpcObject: { tags: ["omarchy-floating-workspace", "omarchy-minimized-from-3"] },
    }));
    expect(window).toMatchObject({ state: "Minimized", workspaceId: 3 });
  });

  test("a minimized window without its tag yet has no workspace", () => {
    const window = toWindow(toplevel({ workspace: { id: -98, name: "special:minimized" }, lastIpcObject: null }));
    expect(window).toMatchObject({ state: "Minimized", workspaceId: null });
  });

  test("keeps an address that already has the 0x prefix", () => {
    expect(toWindow(toplevel({ address: "0xb" }))?.address).toBe("0xb" as Address);
  });

  test("skips dialogs and toplevels without an app id", () => {
    expect(toWindow(toplevel({ wayland: { appId: "kitty", parent: {} } }))).toBeNull();
    expect(toWindow(toplevel({ wayland: { appId: "", parent: null } }))).toBeNull();
    expect(toWindow(toplevel({ wayland: null }))).toBeNull();
  });
});
