# Neoscripts Extension for Desktop Browsers
A browser extension that transcribes pages into a constructed script or alphabet. Currently working on the Shwa alphabet for American English, and will be adding Shavian and Tengwar next.

Supports Chrome, Firefox, Edge, Opera, Vivaldi, and Safari (10+).

## Setup (for testing and development)

### Any browser except Safari

1. Clone or download this repository.
2. In your browser's address bar, enter its extensions page URL:
    - Chrome - `chrome:extensions`
    - Firefox - `about:debugging#addons`
    - Edge - `about:flags`
    - Opera - `opera:extensions`
    - Vivaldi - `vivaldi:extensions`
3. Toggle "Developer Mode" on.
    - Or in Firefox, "Enable add-on debugging".
    - Or in Edge, "Enable extension developer features".
4. Click "Load Unpacked".
    - Or in Firefox, "Load Temporary Add-on...".
    - Or in Edge:
        - Click the `...` "More" menu.
        - Select "Extensions" from the menu.
        - Click the "Load extension" button.
5. Select the cloned/downloaded folder `neoscripts-extension/Extension` or any file inside it.
6. Open any webpage, and the text should be affected.

If you make changes to the extension's code or other files, click its reload icon on the extensions page.

### Safari

In Safari 10 or higher, an extension comes bundled with a macOS app. To test it you need to build and run the included Xcode project.

1. Clone this repository.
2. Download Xcode from the Mac App Store and launch it.
3. Open `neoscripts-extension/Neoscripts.xcodeproj`.
4. Sign in with your Mac Developer ID or use ad-hoc signing.
5. Clean, Build and Run the macOS app. (`⇧⌘K`, `⌘R`).
6. In Safari, open Preferences (`⌘.`) -> Advanced, and enable "Show Develop in menu bar".
7. In Preferences -> Extensions, enable the checkbox next to "Extension, from Neoscripts".
    - If it's not listed, then in the menu bar, click Develop -> Allow Unsigned Extensions. (Near the bottom.)
8. Open any webpage, and the text should be affected.
