import Cocoa
import WebKit

class DesktopAppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate, WKScriptMessageHandler {
    var window: NSWindow!
    var webView: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        setupMainMenu()

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

        window.title = "Besvelte"
        window.titlebarAppearsTransparent = true
        window.titleVisibility = .hidden
        window.backgroundColor = NSColor(red: 0.08, green: 0.09, blue: 0.10, alpha: 1.0)
        window.isMovableByWindowBackground = true
        window.delegate = self

        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        // Enable WebGL & hardware acceleration
        config.preferences.setValue(true, forKey: "webGLEnabled")

        // Capture JS errors and console logs
        config.userContentController.add(self, name: "consoleLog")
        let script = """
        window.addEventListener('error', (e) => {
            window.webkit.messageHandlers.consoleLog.postMessage('JS Error: ' + e.message + ' at ' + e.filename + ':' + e.lineno);
        });
        window.addEventListener('unhandledrejection', (e) => {
            window.webkit.messageHandlers.consoleLog.postMessage('Unhandled Promise Rejection: ' + e.reason);
        });
        const origError = console.error;
        console.error = (...args) => {
            window.webkit.messageHandlers.consoleLog.postMessage('console.error: ' + args.join(' '));
            origError.apply(console, args);
        };
        """
        config.userContentController.addUserScript(WKUserScript(source: script, injectionTime: .atDocumentStart, forMainFrameOnly: false))

        let contentBounds = window.contentView?.bounds ?? NSRect(x: 0, y: 0, width: width, height: height)
        webView = WKWebView(frame: contentBounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.navigationDelegate = self
        webView.setValue(false, forKey: "drawsBackground") // Transparent initial view
        window.contentView = webView

        let urlString = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "http://localhost:5174"
        print("[Desktop] Loading URL: \(urlString)")
        if let url = URL(string: urlString) {
            webView.load(URLRequest(url: url))
        }

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("[WebKit Log] \(message.body)")
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("[WebKit] Navigation finished: \(webView.url?.absoluteString ?? "")")
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("[WebKit] Navigation failed: \(error.localizedDescription)")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("[WebKit] Provisional navigation failed: \(error.localizedDescription)")
    }

    func setupMainMenu() {
        let mainMenu = NSMenu()

        // 1. Besvelte Application Menu
        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu(title: "Besvelte")
        appMenuItem.submenu = appMenu

        appMenu.addItem(withTitle: "About Besvelte", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        let settingsItem = NSMenuItem(title: "Settings…", action: #selector(openSettings(_:)), keyEquivalent: ",")
        settingsItem.target = self
        appMenu.addItem(settingsItem)
        appMenu.addItem(NSMenuItem.separator())

        let servicesItem = NSMenuItem(title: "Services", action: nil, keyEquivalent: "")
        let servicesMenu = NSMenu(title: "Services")
        servicesItem.submenu = servicesMenu
        appMenu.addItem(servicesItem)
        NSApp.servicesMenu = servicesMenu

        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Hide Besvelte", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        let hideOthersItem = NSMenuItem(title: "Hide Others", action: #selector(NSApplication.hideOtherApplications(_:)), keyEquivalent: "h")
        hideOthersItem.keyEquivalentModifierMask = [.command, .option]
        appMenu.addItem(hideOthersItem)
        appMenu.addItem(withTitle: "Show All", action: #selector(NSApplication.unhideAllApplications(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Besvelte", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        // 2. File Menu
        let fileMenuItem = NSMenuItem()
        mainMenu.addItem(fileMenuItem)
        let fileMenu = NSMenu(title: "File")
        fileMenuItem.submenu = fileMenu

        let newThreadItem = NSMenuItem(title: "New Thread", action: #selector(newThread(_:)), keyEquivalent: "n")
        newThreadItem.target = self
        fileMenu.addItem(newThreadItem)

        let chatEmgemItem = NSMenuItem(title: "Chat with Emgem", action: #selector(chatWithEmgem(_:)), keyEquivalent: "e")
        chatEmgemItem.target = self
        fileMenu.addItem(chatEmgemItem)

        let memItem = NSMenuItem(title: "Memory Studio", action: #selector(openMemory(_:)), keyEquivalent: "m")
        memItem.target = self
        fileMenu.addItem(memItem)

        fileMenu.addItem(NSMenuItem.separator())
        fileMenu.addItem(withTitle: "Close Window", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")

        // 3. Edit Menu
        let editMenuItem = NSMenuItem()
        mainMenu.addItem(editMenuItem)
        let editMenu = NSMenu(title: "Edit")
        editMenuItem.submenu = editMenu

        editMenu.addItem(withTitle: "Undo", action: #selector(UndoManager.undo), keyEquivalent: "z")
        editMenu.addItem(withTitle: "Redo", action: #selector(UndoManager.redo), keyEquivalent: "Z")
        editMenu.addItem(NSMenuItem.separator())
        editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")

        // 4. View Menu
        let viewMenuItem = NSMenuItem()
        mainMenu.addItem(viewMenuItem)
        let viewMenu = NSMenu(title: "View")
        viewMenuItem.submenu = viewMenu

        let vMem = NSMenuItem(title: "Memory Studio", action: #selector(openMemory(_:)), keyEquivalent: "1")
        vMem.target = self
        viewMenu.addItem(vMem)

        let vComp = NSMenuItem(title: "Computers", action: #selector(openComputers(_:)), keyEquivalent: "2")
        vComp.target = self
        viewMenu.addItem(vComp)

        let vEvery = NSMenuItem(title: "Run Everywhere", action: #selector(openEverywhere(_:)), keyEquivalent: "3")
        vEvery.target = self
        viewMenu.addItem(vEvery)

        viewMenu.addItem(NSMenuItem.separator())
        let reloadItem = NSMenuItem(title: "Reload", action: #selector(reloadPage(_:)), keyEquivalent: "r")
        reloadItem.target = self
        viewMenu.addItem(reloadItem)

        viewMenu.addItem(withTitle: "Toggle Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")

        // 5. Window Menu
        let windowMenuItem = NSMenuItem()
        mainMenu.addItem(windowMenuItem)
        let windowMenu = NSMenu(title: "Window")
        windowMenuItem.submenu = windowMenu

        windowMenu.addItem(withTitle: "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        windowMenu.addItem(withTitle: "Zoom", action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")

        NSApp.mainMenu = mainMenu
    }

    @objc func openSettings(_ sender: Any?) {
        sendWebAction("open-settings")
    }

    @objc func newThread(_ sender: Any?) {
        sendWebAction("new-thread")
    }

    @objc func chatWithEmgem(_ sender: Any?) {
        sendWebAction("chat-emgem")
    }

    @objc func openMemory(_ sender: Any?) {
        sendWebAction("open-memory")
    }

    @objc func openComputers(_ sender: Any?) {
        sendWebAction("open-computers")
    }

    @objc func openEverywhere(_ sender: Any?) {
        sendWebAction("open-everywhere")
    }

    @objc func reloadPage(_ sender: Any?) {
        webView.reload()
    }

    private func sendWebAction(_ action: String) {
        let script = "window.dispatchEvent(new CustomEvent('besvelte:action', { detail: '\(action)' }))"
        webView.evaluateJavaScript(script, completionHandler: nil)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}

let app = NSApplication.shared
let delegate = DesktopAppDelegate()
app.delegate = delegate
app.run()
