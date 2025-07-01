// シンプルなHTML解析関数
function extractTextFromHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // script、style、noscriptタグを削除
  const unwantedTags = doc.querySelectorAll('script, style, noscript');
  unwantedTags.forEach(tag => tag.remove());
  
  // body部分のテキストを取得
  const body = doc.body || doc.documentElement;
  let text = body.textContent || body.innerText || '';
  
  // 余分な空白や改行を整理
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'readability-extract') {
    try {
      const content = extractTextFromHTML(message.html);
      sendResponse({ content: content || null });
    } catch (error) {
      console.error('[Offscreen] Error extracting text:', error);
      sendResponse({ content: null });
    }
  }
});
