// src/compositor/window/window.ts
var MINIMIZED_WORKSPACE = "special:minimized";
var MINIMIZED_FROM = /^omarchy-minimized-from-(\d+)$/;
var toAddress = (raw) => raw.startsWith("0x") ? raw : "0x" + raw;
function toWindow(toplevel) {
  const appId = toplevel.wayland?.appId;
  if (!appId || toplevel.wayland?.parent)
    return null;
  return Object.assign({ address: toAddress(toplevel.address), appId, title: toplevel.title }, placement(toplevel));
}
function placement(toplevel) {
  if (toplevel.workspace?.name === MINIMIZED_WORKSPACE) {
    return { state: "Minimized", workspaceId: minimizedFrom(toplevel.lastIpcObject) };
  }
  return { state: "Shown", workspaceId: toplevel.workspace?.id ?? null };
}
function minimizedFrom(ipc) {
  const match = (ipc?.tags ?? []).map((tag) => MINIMIZED_FROM.exec(tag)).find((m) => m !== null);
  return match ? Number(match[1]) : null;
}
export {
  toWindow,
  toAddress
};
