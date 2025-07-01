import { Readability } from '@mozilla/readability';

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'extractContent') {
    const documentClone = document.cloneNode(true) as Document;
    const article = new Readability(documentClone).parse();
    const url = window.location.href; // 現在のページのURLを取得

    if (article) {
      sendResponse({ success: true, content: article.textContent, url: url }); // URLも送信
    } else {
      sendResponse({ success: false, message: 'Could not extract content.' });
    }
    return true; // Indicates that the response will be sent asynchronously
  }
});

console.log("content script loaded with readability");
