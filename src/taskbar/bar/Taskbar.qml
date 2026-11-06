import QtQuick
import Quickshell
import Quickshell.Hyprland
import Quickshell.Widgets
import qs.Commons
import qs.Ui
import "../../compositor/window/window.mjs" as Compositor
import "../../compositor/dispatch/dispatch.mjs" as Dispatch
import "../../compositor/minimize/minimize.mjs" as Minimize
import "../model/model.mjs" as Model
import "../chooser"

// One icon per App Group of the active Workspace on this bar's monitor.
BarWidget {
  id: root
  moduleName: "m4s1t4.taskbar"

  readonly property var monitor: {
    var window = root.QsWindow.window
    return window && window.screen ? Hyprland.monitorFor(window.screen) : Hyprland.focusedMonitor
  }
  readonly property int activeWorkspaceId: monitor && monitor.activeWorkspace ? monitor.activeWorkspace.id : -1
  readonly property string focusedAddress: Hyprland.activeToplevel ? Compositor.toAddress(Hyprland.activeToplevel.address) : ""
  readonly property var windows: Hyprland.toplevels.values.map(Compositor.toWindow).filter(function(w) { return w !== null })
  readonly property var groups: Model.workspaceApps(root.windows, root.activeWorkspaceId)

  readonly property int iconSize: Math.round(barSize * 0.6)
  readonly property int slot: iconSize + Style.space(10)
  readonly property color foreground: bar ? bar.barForeground : Color.foreground

  // Click Intent kind -> what carries it out.
  readonly property var actions: ({
    focus: function(window) { root.dispatch(Dispatch.focus(window)) },
    minimize: function(window) { Quickshell.execDetached(Minimize.minimize(window)) },
    restore: function(window) { root.dispatch(Minimize.restore(window, root.activeWorkspaceId)) },
    close: function(window) { root.dispatch(Dispatch.close(window)) }
  })

  visible: groups.length > 0
  implicitWidth: vertical ? barSize : groups.length * slot
  implicitHeight: vertical ? groups.length * slot : barSize

  function dispatch(steps) {
    for (var i = 0; i < steps.length; i++) Hyprland.dispatch(steps[i])
  }

  function perform(intent, group, anchor) {
    if (intent.kind === "choose") return root.openChooser(group, anchor)
    chooser.open = false
    root.actions[intent.kind](intent.window)
  }

  function openChooser(group, anchor) {
    chooser.group = group
    chooser.icon = root.iconFor(group.appId)
    chooser.anchorItem = anchor
    chooser.open = true
  }

  // Called by PopupCard on an outside click and by the bar when another popout opens.
  function close() {
    chooser.open = false
  }

  function iconFor(appId) {
    var entry = DesktopEntries.heuristicLookup(appId)
    return Quickshell.iconPath(entry && entry.icon ? entry.icon : appId, "application-x-executable")
  }

  function tooltip(group) {
    return group.windows.length === 1 ? group.windows[0].title : group.windows.length + " windows"
  }

  // A minimized-from tag reaches Quickshell only with the next client list.
  Connections {
    target: Hyprland
    function onRawEvent(event) {
      var name = event ? String(event.name) : ""
      if (name === "movewindowv2" || name === "openwindow") Hyprland.refreshToplevels()
    }
  }

  Grid {
    anchors.centerIn: parent
    columns: root.vertical ? 1 : Math.max(1, root.groups.length)

    Repeater {
      model: root.groups

      delegate: Item {
        id: slotItem
        required property var modelData
        readonly property bool minimized: modelData.windows.every(function(w) { return w.state === "Minimized" })
        readonly property bool focused: modelData.windows.some(function(w) { return w.address === root.focusedAddress })
        width: root.vertical ? root.barSize : root.slot
        height: root.vertical ? root.slot : root.barSize

        // The crop zooms the icon inside a clipped frame until its opaque
        // square fills the frame.
        Item {
          anchors.centerIn: parent
          width: root.iconSize
          height: root.iconSize
          clip: true
          opacity: slotItem.minimized ? 0.45 : 1

          Image {
            id: icon
            readonly property string url: root.iconFor(slotItem.modelData.appId)
            readonly property var crop: iconCrops.crops[url] || { x: 0, y: 0, side: 1 }
            width: parent.width / crop.side
            height: parent.height / crop.side
            x: -crop.x * width
            y: -crop.y * height
            source: url
            sourceSize: Qt.size(128, 128)
            // Synchronous on purpose: Quickshell's image://icon provider calls
            // QIcon::pixmap, which crashes the shell off the GUI thread.
            asynchronous: false
            fillMode: Image.PreserveAspectFit
            smooth: true
            mipmap: true
            function measure() { if (status === Image.Ready) iconCrops.measure(icon, url) }
            onStatusChanged: measure()
            Component.onCompleted: measure()
          }
        }

        Rectangle {
          visible: slotItem.focused
          anchors.horizontalCenter: parent.horizontalCenter
          anchors.bottom: parent.bottom
          anchors.bottomMargin: Style.space(3)
          width: Math.round(root.iconSize * 0.5)
          height: Style.space(2)
          radius: height / 2
          color: root.foreground
        }

        MouseArea {
          anchors.fill: parent
          hoverEnabled: true
          acceptedButtons: Qt.LeftButton | Qt.MiddleButton
          cursorShape: Qt.PointingHandCursor
          onClicked: function(mouse) {
            var intent = mouse.button === Qt.MiddleButton
              ? Model.middleClickIntent(slotItem.modelData)
              : Model.clickIntent(slotItem.modelData, root.focusedAddress)
            root.perform(intent, slotItem.modelData, slotItem)
          }
          onEntered: if (root.bar) root.bar.showTooltip(slotItem, root.tooltip(slotItem.modelData))
          onExited: if (root.bar) root.bar.hideTooltip(slotItem)
        }
      }
    }
  }

  IconCrops {
    id: iconCrops
  }

  Chooser {
    id: chooser
    anchorItem: root
    bar: root.bar
    owner: root
    onPicked: function(window) { root.perform(Model.windowIntent(window, root.focusedAddress), null, null) }
    onMiddlePicked: function(window) { root.perform({ kind: "close", window: window }, null, null) }
  }
}
