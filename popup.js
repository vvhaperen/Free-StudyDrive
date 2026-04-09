document.addEventListener('DOMContentLoaded', async function() {
    const downloadButton = document.getElementById('downloadButton');
    const status = document.getElementById('status');

    // Get the active tab's URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const urlPattern = /^https:\/\/www\.studydrive\.net\/[a-z]{2}\/doc\//i;

    if (!tab || !urlPattern.test(tab.url)) {
        status.textContent = 'Open a StudyDrive document page, then click here.';
        return;
    }

    // We're on a StudyDrive doc page
    status.textContent = 'Ready to download!';
    downloadButton.style.display = 'block';

    downloadButton.addEventListener('click', async function() {
        downloadButton.textContent = 'Downloading...';
        downloadButton.disabled = true;

        // Execute the download logic in the context of the active tab
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async function() {
                try {
                    const result = await fetch(window.location.href, { credentials: 'include' });
                    if (!result.ok) {
                        alert('[StudyDrive Downloader] Failed to fetch page HTML: ' + result.status + ' ' + result.statusText);
                        return;
                    }
                    const html = await result.text();

                    const linkMatch = /"file_preview"\s*:\s*("[^"]*")/.exec(html);
                    if (!linkMatch) {
                        alert('[StudyDrive Downloader] Download link not found on this page.');
                        return;
                    }
                    let parsedLink;
                    try {
                        parsedLink = JSON.parse(linkMatch[1]);
                    } catch (e) {
                        alert('[StudyDrive Downloader] Download link parsing failed.');
                        return;
                    }

                    const fileNameMatch = /"filename"\s*:\s*("[^"]*")/.exec(html);
                    let fileName = fileNameMatch ? JSON.parse(fileNameMatch[1]) : 'preview.pdf';

                    if (fileName.endsWith('.docx')) {
                        fileName = fileName.slice(0, -5) + '.pdf';
                    }

                    if (!fileName.endsWith('.pdf')) {
                        alert('[StudyDrive Downloader] Only PDF downloads are supported.');
                        return;
                    }

                    const downloadUrl = new URL(parsedLink, window.location.href).toString();
                    const downloadResult = await fetch(downloadUrl, { credentials: 'include' });
                    if (!downloadResult.ok) {
                        alert('[StudyDrive Downloader] Failed to fetch file: ' + downloadResult.status + ' ' + downloadResult.statusText);
                        return;
                    }
                    const blob = await downloadResult.blob();

                    const link = document.createElement('a');
                    const objectUrl = window.URL.createObjectURL(blob);
                    link.download = fileName;
                    link.href = objectUrl;
                    link.target = '_blank';
                    link.rel = 'noopener';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(objectUrl);
                } catch (e) {
                    alert('[StudyDrive Downloader] Error: ' + e.message);
                }
            }
        });

        // Reset button after a delay
        setTimeout(function() {
            downloadButton.textContent = 'Download Document';
            downloadButton.disabled = false;
        }, 3000);
    });
});
