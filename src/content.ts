console.log('[Content] Content script loaded with simple DOM extraction');

// Helper function for i18n in content script
function getMessage(messageName: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(messageName, substitutions);
}

// スクリプトとスタイルタグを除去する関数
function removeScriptsAndStyles(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  
  // script、style、noscriptタグを削除
  const unwantedTags = clone.querySelectorAll('script, style, noscript');
  unwantedTags.forEach(tag => tag.remove());
  
  return clone.textContent || (clone as HTMLElement).innerText || '';
}

// コンテンツを制限する関数
function limitContent(content: string, maxLength: number = 10000): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  // 文の途中で切れないように調整
  const truncated = content.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.8) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'extractContent') {
    console.log('[Content] Received extractContent request');
    const startTime = performance.now();
    
    try {
      const url = window.location.href;
      
      // シンプルなコンテンツ抽出
      let content = '';
      
      // まずbody全体のテキストを取得
      if (document.body) {
        content = removeScriptsAndStyles(document.body);
      } else {
        // bodyがない場合は全体から取得
        content = document.documentElement.textContent || document.documentElement.innerText || '';
      }
      
      // 余分な空白や改行を整理
      content = content.replace(/\s+/g, ' ').trim();
      
      // コンテンツを制限
      const limitedContent = limitContent(content);
      
      const extractTime = ((performance.now() - startTime) / 1000).toFixed(3);
      
      if (limitedContent && limitedContent.length > 50) {
        console.log(`[Content] Successfully extracted content from ${url}`);
        console.log(`[Content] Extraction took ${extractTime} seconds`);
        console.log(`[Content] Content length: ${limitedContent.length} characters`);
        sendResponse({ success: true, content: limitedContent, url: url });
      } else {
        console.error('[Content] Insufficient content extracted');
        sendResponse({ success: false, message: getMessage('insufficientContent') });
      }
    } catch (error: any) {
      console.error('[Content] Error during content extraction:', error);
      sendResponse({ success: false, message: getMessage('extractionError', error.message) });
    }
    
    return true; // Indicates that the response will be sent asynchronously
  }
});