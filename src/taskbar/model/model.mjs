// src/taskbar/model/model.ts
var belongsHere = (window, active) => window.workspaceId === active;
function workspaceApps(windows, active) {
  const here = windows.filter((window) => belongsHere(window, active));
  const appIds = [...new Set(here.map((window) => window.appId))];
  return appIds.map((appId) => ({ appId, windows: here.filter((window) => window.appId === appId) }));
}
function clickIntent(group, focused) {
  if (group.windows.length > 1)
    return { kind: "choose" };
  return windowIntent(group.windows[0], focused);
}
function windowIntent(window, focused) {
  if (window.state === "Minimized")
    return { kind: "restore", window };
  return { kind: window.address === focused ? "minimize" : "focus", window };
}
function middleClickIntent(group) {
  if (group.windows.length > 1)
    return { kind: "choose" };
  return { kind: "close", window: group.windows[0] };
}
export {
  workspaceApps,
  windowIntent,
  middleClickIntent,
  clickIntent
};
