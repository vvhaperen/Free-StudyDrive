chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "STUDYDRIVE_DOWNLOAD") return;

  (async () => {
    try {
      const url = String(message.url || "");
      const filename = String(message.filename || "studydrive.pdf");

      if (!/^https?:\/\//i.test(url)) {
        throw new Error("Invalid download URL");
      }

      const downloadId = await chrome.downloads.download({
        url,
        filename,
        conflictAction: "uniquify",
        saveAs: false,
      });

      sendResponse({ ok: true, downloadId });
    } catch (err) {
      sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  })();

  return true; // keep message channel open for async response
});
