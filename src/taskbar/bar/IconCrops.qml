import QtQuick
import Quickshell
import "icon.mjs" as Icon

// Measures each icon once and keeps its crop by icon URL. It grabs the icon the
// bar already drew and reads the grab back from a PNG file: reloading
// image://icon here would call QIcon::pixmap off the GUI thread and crash the
// shell, Canvas cannot load itemgrabber: URLs, and drawImage() of an Image
// item draws nothing.
Canvas {
  id: root

  readonly property int size: 64
  // shortcut: grabs stay in the runtime dir (tmpfs) until logout, one small
  // PNG per icon; delete them if icons ever change within a session.
  readonly property string grabDir: Quickshell.env("XDG_RUNTIME_DIR") || "/tmp"
  property var crops: ({})
  property var started: ({})
  property var queue: []
  property var current: null

  width: size
  height: size
  opacity: 0

  function measure(image, key) {
    if (key in root.started) return
    root.started[key] = true
    image.grabToImage(function(grab) { root.save(grab, key) }, Qt.size(root.size, root.size))
  }

  function save(grab, key) {
    // Named by icon: every bar (one per monitor) writes the same file for it.
    var path = root.grabDir + "/m4s1t4-taskbar-icon-" + key.replace(/[^A-Za-z0-9.-]/g, "_") + ".png"
    if (!grab.saveToFile(path)) return
    root.queue.push({ key: key, url: "file://" + path })
    root.next()
  }

  function next() {
    if (root.current || !root.available || root.queue.length === 0) return
    root.current = root.queue.shift()
    root.loadImage(root.current.url)
  }

  function read() {
    var ctx = root.getContext("2d")
    ctx.clearRect(0, 0, root.size, root.size)
    ctx.drawImage(root.current.url, 0, 0, root.size, root.size)
    var crops = Object.assign({}, root.crops)
    crops[root.current.key] = Icon.iconCrop(ctx.getImageData(0, 0, root.size, root.size).data, root.size)
    root.crops = crops
    root.unloadImage(root.current.url)
    root.current = null
    root.next()
  }

  onAvailableChanged: root.next()
  onImageLoaded: if (root.current && root.isImageLoaded(root.current.url)) root.read()
}
