import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

  let shareProtocol = "nestly"

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)

    guard
      let extensionContext = self.extensionContext,
      let item = extensionContext.inputItems.first as? NSExtensionItem,
      let attachments = item.attachments
    else {
      completeExtension()
      return
    }

    // Prefer a real URL
    for provider in attachments {
      if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
        handleURL(provider)
        return
      }
    }

    // Fallback: text that looks like a URL
    for provider in attachments {
      if provider.hasItemConformingToTypeIdentifier(UTType.text.identifier) {
        handleText(provider)
        return
      }
    }

    // Nothing useful, just finish
    completeExtension()
  }

  private func handleURL(_ provider: NSItemProvider) {
    provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { item, error in
      var candidate: String? = nil

      if let url = item as? URL {
        candidate = url.absoluteString
      } else if let str = item as? String {
        candidate = str
      }

      DispatchQueue.main.async {
        self.openHostApp(with: candidate)
      }
    }
  }

  private func handleText(_ provider: NSItemProvider) {
    provider.loadItem(forTypeIdentifier: UTType.text.identifier, options: nil) { item, error in
      var candidate: String? = nil

      if let str = item as? String {
        if str.lowercased().hasPrefix("http") {
          candidate = str
        }
      }

      DispatchQueue.main.async {
        self.openHostApp(with: candidate)
      }
    }
  }

  private func openHostApp(with candidateUrl: String?) {
    guard
      let raw = candidateUrl,
      let encoded = raw.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)
    else {
      completeExtension()
      return
    }

    let urlString = "\(shareProtocol)://?url=\(encoded)"
    guard let url = URL(string: urlString) else {
      completeExtension()
      return
    }

    var responder: UIResponder? = self
    var foundApplication = false

    while responder != nil {
      if let app = responder as? UIApplication {
        foundApplication = true
        if app.canOpenURL(url) {
          app.open(url, options: [:], completionHandler: nil)
        }
        break
      }
      responder = responder?.next
    }

    if !foundApplication {
      completeExtension()
      return
    }

    completeExtension()
  }

  private func completeExtension() {
    extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
  }
}
