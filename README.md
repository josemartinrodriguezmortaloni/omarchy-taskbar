```
 $pLLLLLLL##LLLLLLLp$
 ${+000000MQ   ~00+{$
 ${{$            ${{$
 ${{$            ${{$          Taskbar for the Omarchy shell. Minimized windows come back in one click.
 $zz$            ${{$
 $vv$            ${{$          omarchy plugin add https://github.com/josemartinrodriguezmortaloni/omarchy-taskbar.git
 ${{$            ${{$
 ${{$            ${{$          ⚠ Status: tested on Omarchy Quattro. Plugins run unsandboxed: read the code first.
 ${~LLLLLL##LLLLLL~{$
 $b0000000MQ 000000b$
```

omarchy-taskbar is a bar widget for the [Omarchy](https://omarchy.org) shell. It shows one icon per app of the active workspace, minimized windows included, and replaces the Omarchy dock on floating workspaces. An app with several windows opens a chooser with a preview of each window.

## Highlights

- **Minimized windows stay visible:** a dimmed icon marks them, and one click restores them to the active workspace
- **Window chooser:** an app with several windows opens a card with a preview of each window, minimized ones included
- **Same as the dock:** minimizing and restoring use Omarchy's own mechanism, so the dock and the bar agree on every window
- **Even icons:** each icon is measured once and zoomed until its opaque part fills the slot, whatever margin its theme draws

<p>
  <a href="https://omarchy.org"><img alt="Omarchy Quattro" src="https://img.shields.io/badge/OMARCHY-QUATTRO-0a0a0a.svg?style=for-the-badge&amp;labelColor=000000" height="28"></a>
  <a href="https://hypr.land"><img alt="Hyprland" src="https://img.shields.io/badge/HYPRLAND-LUA-0a0a0a.svg?style=for-the-badge&amp;logo=hyprland&amp;labelColor=000000" height="28"></a>
  <a href="https://quickshell.org"><img alt="Quickshell" src="https://img.shields.io/badge/QUICKSHELL-0.3-0a0a0a.svg?style=for-the-badge&amp;labelColor=000000" height="28"></a>
  <a href="LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/LICENSE-MIT-0a0a0a.svg?style=for-the-badge&amp;labelColor=000000" height="28"></a>
  <a href="https://github.com/josemartinrodriguezmortaloni/omarchy-taskbar/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/josemartinrodriguezmortaloni/omarchy-taskbar.svg?style=for-the-badge&amp;labelColor=000000" height="28"></a>
</p>

## Install

The plugin needs Omarchy with the Quickshell-based Omarchy shell and the Hyprland Lua config (Omarchy Quattro). The built files are in the repo, so it needs no build step.

```bash
omarchy plugin add https://github.com/josemartinrodriguezmortaloni/omarchy-taskbar.git --enable
```

The command asks where to put the widget in the bar; the default section is `left`.

## Get started

```bash
omarchy plugin disable omarchy.dock                                        # the bar replaces the dock
omarchy bar move m4s1t4.taskbar --section left --after omarchy.workspaces  # move the widget
omarchy plugin update m4s1t4.taskbar                                       # update
omarchy plugin remove m4s1t4.taskbar && omarchy plugin enable omarchy.dock # uninstall, dock back
```

## Usage

| Action                              | Result                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| Click an app with one window        | Focuses the window. Minimizes it when it has the focus. Restores it when it is minimized.   |
| Click an app with several windows   | Opens the window chooser                                                                    |
| Click a preview in the chooser      | Same as a click on an app with one window, for that window                                  |
| Middle click an app with one window | Closes the window                                                                           |
| Middle click a preview              | Closes that window                                                                          |
| Click outside the chooser           | Closes the chooser                                                                          |

A line under an icon marks the app with the focus. A restored window comes back to the active workspace, as with the dock.

Minimizing calls Omarchy's `omarchy-hyprland-window-minimize`, which works only on floating workspaces. On a tiled workspace, a click on the focused window does nothing.

## How it works

- **Windows:** the widget reads them from Quickshell's Hyprland integration. A window is minimized when Omarchy has moved it to `special:minimized`; its tag `omarchy-minimized-from-<workspace>` puts it on the workspace it left.
- **Actions:** focus, restore and close go to Hyprland as Lua dispatches (`hl.dsp.focus`, `hl.dsp.window.move`, `hl.dsp.window.close`). Minimize calls the Omarchy script.
- **Previews:** one `ScreencopyView` capture when the chooser opens. Hyprland keeps drawing minimized windows, so they have previews too.
- **Icons:** each icon loads on the GUI thread, gets grabbed once, and is zoomed by the square around its opaque pixels. Reloading `image://icon` off the GUI thread crashes the shell in `QIcon::pixmap`.

## Development

The logic is TypeScript in `src/`. `bun build` compiles each module to an `.mjs` file next to it, and the QML files import those. Commit the `.mjs` files with the change.

| Path                     | Holds                                         |
| ------------------------ | --------------------------------------------- |
| `src/compositor/window`  | Hyprland toplevel to Window                   |
| `src/compositor/dispatch`| Focus and close dispatches                    |
| `src/compositor/minimize`| Omarchy minimize and restore                  |
| `src/taskbar/model`      | Which windows show, and what a click does     |
| `src/taskbar/bar`        | The bar widget (entry point) and icon sizing  |
| `src/taskbar/chooser`    | The window chooser                            |
| `docs/`                  | Quality requirements and domain design        |

Link a clone into the plugins folder to work on it:

```bash
git clone https://github.com/josemartinrodriguezmortaloni/omarchy-taskbar.git && cd omarchy-taskbar
bun install
ln -s "$PWD" ~/.config/omarchy/plugins/m4s1t4.taskbar
omarchy plugin enable m4s1t4.taskbar --section left
```

Run `omarchy restart shell` after each change: the shell hot-reloads plugins with `inotifywait -r`, which does not follow a symlink.

Gate every change before a commit:

| Command                     | Checks                                                  |
| --------------------------- | ------------------------------------------------------- |
| `bun test`                  | Acceptance scenarios of `docs/ddd/*/scenarios.feature`  |
| `bun run typecheck`         | TypeScript                                              |
| `bun run complexity`        | Cyclomatic complexity of 3 or less in every function    |
| `bun run build`             | Rebuilds the `.mjs` files                               |
| `omarchy plugin validate .` | The Omarchy plugin manifest                             |

Two limits of the QML JavaScript engine shape the code:

- **No object spread:** QML has no `{ ...x }`, and `bun build` does not lower syntax. Use `Object.assign`.
- **No symlinks:** `omarchy plugin validate` rejects them in the plugin folder, so `postinstall` removes `node_modules/.bin`.

## Credits

Built for [Omarchy](https://omarchy.org) and its Quickshell-based shell. The restore steps follow the Omarchy dock. MIT license.
