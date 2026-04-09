
(function () {
  const urlPattern = /^https:\/\/www\.studydrive\.net\/[a-z]{2}\/doc\//i;
  const BUTTON_ID = "studydrive-download-btn";
  const BUTTON_WRAP_ID = "studydrive-download-btn-wrap";

  function isDocPage() {
    return urlPattern.test(window.location.href);
  }

  function ensureButton() {
    if (!isDocPage()) return;
    if (document.getElementById(BUTTON_ID)) return;
    if (!document.documentElement) return;

    const wrap = createWrap();
    const button = createButton();
    wrap.appendChild(button);

    // Append to <html> so it's less likely to be affected by body re-renders.
    document.documentElement.appendChild(wrap);
  }

  function createWrap() {
    const existing = document.getElementById(BUTTON_WRAP_ID);
    if (existing) return existing;

    const wrap = document.createElement("div");
    wrap.id = BUTTON_WRAP_ID;
    wrap.style.position = "fixed";
    wrap.style.top = "88px";
    wrap.style.right = "20px";
    wrap.style.zIndex = "2147483647"; // max-ish z-index to stay on top
    wrap.style.pointerEvents = "none"; // only the button should receive clicks
    return wrap;
  }

  function createButton() {
    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.setAttribute("aria-label", "Download StudyDrive document");

    button.style.pointerEvents = "auto";
    button.style.backgroundColor = "#16a34a";
    button.style.color = "white";
    button.style.padding = "12px 16px";
    button.style.border = "1px solid rgba(0,0,0,0.15)";
    button.style.borderRadius = "10px";
    button.style.cursor = "pointer";
    button.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    button.style.fontSize = "14px";
    button.style.fontWeight = "700";
    button.style.letterSpacing = "0.2px";
    button.style.display = "inline-flex";
    button.style.alignItems = "center";
    button.style.gap = "8px";
    button.style.boxShadow = "0 10px 25px rgba(0,0,0,0.25)";
    button.style.transition = "transform 0.15s ease, filter 0.15s ease";

    const buttonText = document.createElement("span");
    buttonText.textContent = "Download Document";
    button.appendChild(buttonText);

    button.addEventListener("mouseenter", function () {
      button.style.transform = "translateY(-1px) scale(1.05)";
      button.style.filter = "brightness(1.05)";
    });

    button.addEventListener("mouseleave", function () {
      button.style.transform = "scale(1)";
      button.style.filter = "none";
    });

    button.addEventListener("click", onDownloadClick);

    return button;
  }

  async function onDownloadClick() {
    try {
      console.log("[StudyDrive Download] Download button clicked");

      const result = await fetch(window.location.href, { credentials: "include" });
      if (!result.ok) {
        console.error("[StudyDrive Download] Failed to fetch page HTML", result.status, result.statusText);
        return;
      }
      const html = await result.text();

      const parsedLink = getDownloadLink(html);
      if (!parsedLink) {
        console.error("[StudyDrive Download] Download link not found");
        return;
      }

      const fileName = getFileName(html);
      if (!fileName) {
        console.error("[StudyDrive Download] File extension not supported (only .pdf)");
        return;
      }

      const downloadUrl = new URL(parsedLink, window.location.href).toString();

      if (!chrome?.runtime?.sendMessage) {
        console.error("[StudyDrive Download] chrome.runtime.sendMessage not available");
        return;
      }

      const resp = await chrome.runtime.sendMessage({
        type: "STUDYDRIVE_DOWNLOAD",
        url: downloadUrl,
        filename: fileName,
      });

      if (!resp?.ok) {
        console.error("[StudyDrive Download] Download failed", resp?.error || resp);
      }
    } catch (err) {
      console.error("[StudyDrive Download] Unexpected error", err);
    }
  }

  function getDownloadLink(html) {
    const linkMatch = /"file_preview"\s*:\s*("[^"]*")/.exec(html);
    if (!linkMatch) return null;
    try {
      return JSON.parse(linkMatch[1]);
    } catch {
      return null;
    }
  }

  function getFileName(html) {
    const fileNameMatch = /"filename"\s*:\s*("[^"]*")/.exec(html);
    if (!fileNameMatch) return "preview.pdf";

    let fileName = JSON.parse(fileNameMatch[1]);

    if (fileName.endsWith(".docx")) {
      fileName = fileName.slice(0, -5) + ".pdf";
    }

    if (!fileName.endsWith(".pdf")) {
      return null;
    }

    return fileName;
  }

  // SPA support: StudyDrive navigates without full reload.
  function hookHistory() {
    const _pushState = history.pushState;
    const _replaceState = history.replaceState;

    history.pushState = function () {
      const ret = _pushState.apply(this, arguments);
      setTimeout(ensureButton, 0);
      return ret;
    };

    history.replaceState = function () {
      const ret = _replaceState.apply(this, arguments);
      setTimeout(ensureButton, 0);
      return ret;
    };

    window.addEventListener("popstate", function () {
      setTimeout(ensureButton, 0);
    });
  }

  hookHistory();
  ensureButton();
  // If body isn't ready yet, try again soon.
  const bodyWait = setInterval(() => {
    ensureButton();
    if (document.documentElement && (!isDocPage() || document.getElementById(BUTTON_ID))) clearInterval(bodyWait);
  }, 500);

  // If the site re-renders and removes our button, put it back.
  const mo = new MutationObserver(() => {
    if (!isDocPage()) return;
    if (!document.getElementById(BUTTON_ID)) ensureButton();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
