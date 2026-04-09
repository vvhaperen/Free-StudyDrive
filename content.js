
(function() {
    const urlPattern = /^https:\/\/www\.studydrive\.net\/[a-z]{2}\/doc\//i;
    if (urlPattern.test(window.location.href)) {
        if (document.getElementById('studydrive-download-btn')) return;
        const newButton = createButton();

        document.body.appendChild(newButton);

        function createButton() {
            const button = document.createElement('button');
            button.id = 'studydrive-download-btn';
            button.className = 'dnbtn';
            button.style.backgroundColor = 'green';
            button.style.color = 'white';
            button.style.padding = '15px';
            button.style.border = 'none';
            button.style.cursor = 'pointer';
            button.style.position = 'fixed';
            button.style.bottom = '20px';
            button.style.right = '20px';
            button.style.zIndex = '1000';
            button.style.transition = 'transform 0.3s ease-in-out';

            const buttonText = document.createElement('span');
            buttonText.textContent = 'Download Document';
            button.appendChild(buttonText);

           
            return button;
        }

        newButton.addEventListener('mouseenter', function() {
            newButton.style.transform = 'scale(1.1)';
        });

        newButton.addEventListener('mouseleave', function() {
            newButton.style.transform = 'scale(1)';
        });

        newButton.addEventListener('click', async function() {
            try {
                console.log('[StudyDrive Download] Download button clicked');

                const result = await fetch(window.location.href, { credentials: 'include' });
                if (!result.ok) {
                    console.error('[StudyDrive Download] Failed to fetch page HTML', result.status, result.statusText);
                    return;
                }
                const html = await result.text();

                const parsedLink = getDownloadLink(html);
                if (!parsedLink) {
                    console.error('[StudyDrive Download] Download link not found');
                    return;
                }

                const fileName = getFileName(html);
                if (!fileName) {
                    console.error('[StudyDrive Download] File extension not supported (only .pdf)');
                    return;
                }

                const downloadUrl = new URL(parsedLink, window.location.href).toString();
                const downloadResult = await fetch(downloadUrl, { credentials: 'include' });
                if (!downloadResult.ok) {
                    console.error('[StudyDrive Download] Failed to fetch file', downloadResult.status, downloadResult.statusText);
                    return;
                }

                const blob = await downloadResult.blob();
                downloadFile(blob, fileName);
            } catch (err) {
                console.error('[StudyDrive Download] Unexpected error', err);
            }
        });

        function getDownloadLink(html) {
            const linkMatch = /"file_preview"\s*:\s*("[^"]*")/.exec(html);
            if (!linkMatch) {
                return null;
            }
            try {
                return JSON.parse(linkMatch[1]);
            } catch {
                return null;
            }
        }

        function getFileName(html) {
            const fileNameMatch = /"filename"\s*:\s*("[^"]*")/.exec(html);
            if (!fileNameMatch) {
                return "preview.pdf";
            }
            let fileName = JSON.parse(fileNameMatch[1]);

            // this removes file extension docx and adds pdf file extension.
            if (fileName.endsWith('.docx')) {
                fileName = fileName.slice(0, -5) + '.pdf';
            }

            // this is to ensure only pdfs are downloaded.
            if (!fileName.endsWith('.pdf')) {
                return null;
            }

            return fileName;
        }

        function downloadFile(blob, fileName) {
            const link = document.createElement('a');
            const objectUrl = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.href = objectUrl;
            link.target = "_blank";
            link.rel = "noopener";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(objectUrl);
        }
    }
})();
