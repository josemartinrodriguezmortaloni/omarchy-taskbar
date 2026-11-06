# Taskbar for Omarchy

A bar widget for the [Omarchy](https://omarchy.org) shell that shows the apps of
the active workspace, minimized windows included. Use it in place of the Omarchy
dock on floating workspaces.

- One icon per app on the active workspace of each monitor.
- Minimized windows stay in the bar with a dimmed icon, and one click brings
  them back.
- An app with several windows opens a chooser with a preview of each window.
- A line under the icon marks the app that has the focus.

## Requirements

- Omarchy with the Quickshell-based Omarchy shell and the Hyprland Lua config.
- Quickshell 0.3 or later (it ships with Omarchy).

Minimizing uses Omarchy's own `omarchy-hyprland-window-minimize`, which works
only on floating workspaces. On a tiled workspace, a click on the focused window
does nothing.

## Install

```sh
omarchy plugin add https://github.com/josemartinrodriguezmortaloni/omarchy-taskbar.git --enable
```

The command asks where to put the widget in the bar. The default section is
`left`. To move the widget later:

```sh
omarchy bar move m4s1t4.taskbar --section left --after omarchy.workspaces
```

To replace the dock, turn it off:

```sh
omarchy plugin disable omarchy.dock
```

## Usage

| Action | Result |
|---|---|
| Click an app with one window | Focuses the window. Minimizes it if it already has the focus. Restores it if it is minimized. |
| Click an app with several windows | Opens the window chooser. |
| Click a preview in the chooser | Same as a click on an app with one window, for that window. |
| Middle click an app with one window | Closes the window. |
| Middle click a preview | Closes that window. |
| Click outside the chooser | Closes the chooser. |

A restored window comes back to the active workspace, as with the Omarchy dock.

## Update and uninstall

```sh
omarchy plugin update m4s1t4.taskbar
omarchy plugin remove m4s1t4.taskbar
omarchy plugin enable omarchy.dock   # bring the dock back
```

## How it works

The widget reads windows from Quickshell's Hyprland integration. A window is
minimized when Omarchy has moved it to `special:minimized`. Omarchy tags it with
`omarchy-minimized-from-<workspace>`, and the widget uses that tag to show the
window on the workspace it left.

Actions go to Hyprland as Lua dispatches (`hl.dsp.focus`,
`hl.dsp.window.move`, `hl.dsp.window.close`). Minimizing calls
`omarchy-hyprland-window-minimize`, so the dock and this widget agree on the
state of every window.

Previews are a single `ScreencopyView` capture, taken when the chooser opens.
Hyprland keeps drawing minimized windows, so they have previews too.

## Develop

The logic is TypeScript in `src/`. `bun build` compiles each module to an `.mjs`
file next to it, and the QML files import those. The built `.mjs` files are
committed, so `omarchy plugin add` works without Bun.

```
src/
  compositor/   Hyprland and Omarchy window mechanics
    window/     Hyprland toplevel -> Window
    dispatch/   focus and close dispatches
    minimize/   Omarchy minimize and restore
  taskbar/
    model/      which windows show, and what a click does
    bar/        the bar widget (entry point)
    chooser/    the window chooser
docs/           quality requirements and domain design
```

| Command | Checks |
|---|---|
| `bun install` | Installs TypeScript and the Bun types |
| `bun test` | Acceptance scenarios from `docs/ddd/*/scenarios.feature` |
| `bun run typecheck` | TypeScript |
| `bun run complexity` | Every function has a cyclomatic complexity of 3 or less |
| `bun run build` | Rebuilds the `.mjs` files |
| `omarchy plugin validate .` | The Omarchy plugin manifest |

To develop from a clone, link it into the plugins folder:

```sh
ln -s "$PWD" ~/.config/omarchy/plugins/m4s1t4.taskbar
omarchy plugin enable m4s1t4.taskbar --section left
```

After each change, run `omarchy restart shell`. The shell hot-reloads plugins
with `inotifywait -r`, which does not follow a symlink.

Two constraints of the QML JavaScript engine:

- It has no object spread (`{ ...x }`), and `bun build` does not lower syntax.
  Use `Object.assign`.
- `omarchy plugin validate` rejects symlinks in the plugin folder. The
  `postinstall` script removes `node_modules/.bin`.

## License

MIT
