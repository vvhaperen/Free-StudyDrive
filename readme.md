# Free StudyDrive Document Downloader (Chrome Extension)

This extension adds a **Download Document** button, so you can download documents without paying.

## Install (from GitHub)

- **Step 1**: On this GitHub repo page, click **Code → Download ZIP**

![Code → Download ZIP](assets/01-github-code-download-zip.png)

- **Step 2**: Extract the ZIP file (right-click → **Extract All…**)

![Extract All…](assets/03-extract-all.png)

- **Tip**: If you can’t find the ZIP you downloaded, click the download icon in Chrome and choose **Show in folder**.

![Show in folder](assets/02-chrome-show-in-folder.png)

- **Step 3**: Open Chrome and go to `chrome://extensions`
- **Step 4**: Turn on **Developer mode** (top-right toggle)
- **Step 5**: Click **Load unpacked**
- **Step 6**: Select the extracted folder that contains `manifest.json`

![chrome://extensions + Developer mode + Load unpacked](assets/04-load-unpacked.png)

## Use

- **Step 1**: Open a StudyDrive document page like:
  - `https://www.studydrive.net/<language>/doc/...`
- **Step 2**: Look for the green **Download Document** button on the page (top-right)
- **Step 3**: Click it — the download should start automatically

## Update the extension (when this repo changes)

- Re-download the ZIP from GitHub and extract it (replace your old folder), **or**
- If you pulled changes into the same folder, go to `chrome://extensions` and click **Reload** on the extension card.

## Troubleshooting

- **Button not showing**
  - Make sure you’re on a URL that contains `/doc/`
  - Go to `chrome://extensions` → **Reload** the extension → refresh the StudyDrive tab (try **Ctrl+F5**)

- **It says “downloading” but nothing happens**
  - Try Chrome Downloads (`Ctrl+J`) to see if it started/failed
  - Reload the extension and try again

## Notes

- **Browser support**: tested on **Google Chrome**