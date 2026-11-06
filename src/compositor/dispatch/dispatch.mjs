// src/compositor/dispatch/dispatch.ts
var target = (window) => `window = "address:${window.address}"`;
function focus(window) {
  if (window.state === "Minimized")
    return [];
  return [`hl.dsp.focus({ ${target(window)} })`, `hl.dsp.window.alter_zorder({ mode = "top", ${target(window)} })`];
}
var close = (window) => [`hl.dsp.window.close({ ${target(window)} })`];
export {
  target,
  focus,
  close
};
