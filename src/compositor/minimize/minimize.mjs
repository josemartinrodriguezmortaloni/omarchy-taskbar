// src/compositor/dispatch/dispatch.ts
var target = (window) => `window = "address:${window.address}"`;
function focus(window) {
  if (window.state === "Minimized")
    return [];
  return [`hl.dsp.focus({ ${target(window)} })`, `hl.dsp.window.alter_zorder({ mode = "top", ${target(window)} })`];
}
var close = (window) => [`hl.dsp.window.close({ ${target(window)} })`];

// src/compositor/minimize/minimize.ts
var minimize = (window) => ["omarchy-hyprland-window-minimize", window.address];
var restore = (window, to) => [
  `hl.dsp.window.move({ workspace = "${to}", ${target(window)} })`,
  ...focus(Object.assign({}, window, { state: "Shown", workspaceId: to }))
];
export {
  restore,
  minimize
};
