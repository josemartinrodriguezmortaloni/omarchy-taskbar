import QtQuick
import Quickshell
import Quickshell.Hyprland
import Quickshell.Wayland
import Quickshell.Widgets
import qs.Commons
import qs.Ui
import "../../compositor/window/window.mjs" as Compositor

// Window Chooser: one Preview per Window of an App Group. It only reports the
// pick; the bar decides what the pick asks for.
PopupCard {
  id: chooser

  property var group: null
  property string icon: ""
  signal picked(var window)
  signal middlePicked(var window)

  readonly property color foreground: bar ? bar.barForeground : Color.foreground
  // fittedContentWidth takes the whole card width, while fittedContentHeight
  // adds the inset itself; the row needs the same inset on both axes.
  readonly property real horizontalInset: padding * 2 + Border.left(borderSpec) + Border.right(borderSpec)
  readonly property int previewSpacing: Style.space(10)
  readonly property int windowCount: group ? group.windows.length : 0
  // Previews shrink so that every Window still fits on the screen.
  readonly property int previewWidth: Math.min(Style.space(220), Math.floor(
    (availableCardWidth - horizontalInset - previewSpacing * (windowCount - 1)) / Math.max(1, windowCount)))

  contentWidth: chooser.fittedContentWidth(row.implicitWidth + horizontalInset)
  contentHeight: chooser.fittedContentHeight(row.implicitHeight)

  function toplevelFor(address) {
    var list = Hyprland.toplevels.values
    for (var i = 0; i < list.length; i++) {
      if (Compositor.toAddress(list[i].address) === address) return list[i].wayland
    }
    return null
  }

  Row {
    id: row
    spacing: chooser.previewSpacing

    Repeater {
      model: chooser.open && chooser.group ? chooser.group.windows : []

      delegate: Column {
        id: card
        required property var modelData
        readonly property bool minimized: modelData.state === "Minimized"
        spacing: Style.space(6)
        width: chooser.previewWidth

        Item {
          width: parent.width
          height: Math.round(chooser.previewWidth * 0.62)

          // Captured once as the chooser opens; Hyprland keeps drawing
          // Minimized Windows, so they capture too (HS-01).
          ScreencopyView {
            id: preview
            anchors.fill: parent
            live: false
            captureSource: chooser.toplevelFor(card.modelData.address)
            opacity: card.minimized ? 0.6 : 1
          }

          IconImage {
            anchors.centerIn: parent
            visible: !preview.hasContent
            implicitSize: Style.space(48)
            source: chooser.icon
          }

          MouseArea {
            anchors.fill: parent
            acceptedButtons: Qt.LeftButton | Qt.MiddleButton
            cursorShape: Qt.PointingHandCursor
            onClicked: function(mouse) {
              if (mouse.button === Qt.MiddleButton) chooser.middlePicked(card.modelData)
              else chooser.picked(card.modelData)
            }
          }
        }

        Text {
          width: parent.width
          text: card.modelData.title
          textFormat: Text.PlainText
          elide: Text.ElideRight
          color: chooser.foreground
          opacity: card.minimized ? 0.6 : 0.9
          font.family: chooser.bar ? chooser.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.body
        }
      }
    }
  }
}
