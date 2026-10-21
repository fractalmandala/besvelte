import Cocoa
import WebKit

class DesktopAppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    var window: NSWindow!
    var webView: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)

        let screen = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1360, height: 860)
        let width: CGFloat = min(1360, screen.width - 40)
        let height: CGFloat = min(880, screen.height - 40)
        let rect = NSRect(
            x: screen.midX - width / 2,
            y: screen.midY - height / 2,
            width: width,
            height: height
        )

        window = NSWindow(
            contentRect: rect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )

        window.title = "GeckoBox"
        window.titlebarAppearsTransparent = true
        window.titleVisibility = .hidden
        window.backgroundColor = NSColor(red: 0.08, green: 0.09, blue: 0.10, alpha: 1.0)
        window.isMovableByWindowBackground = true
        window.delegate = self

        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        // Enable WebGL & hardware acceleration
        config.preferences.setValue(true, forKey: "webGLEnabled")

        webView = WKWebView(frame: rect, configuration: config)
        webView.setValue(false, forKey: "drawsBackground") // Transparent initial view
        window.contentView = webView

        let urlString = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "http://localhost:5174"
        if let url = URL(string: urlString) {
            webView.load(URLRequest(url: url))
        }

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}

let app = NSApplication.shared
let delegate = DesktopAppDelegate()
app.delegate = delegate
app.run()
