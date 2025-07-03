export function isRestrictedUrl(url: string): boolean {
  if (!url) return true;
  
  const restrictedProtocols = [
    'chrome://',
    'chrome-extension://',
    'moz-extension://',
    'about:',
    'file://',
    'data:',
    'javascript:',
    'edge://',
    'safari-extension://'
  ];
  
  const restrictedDomains = [
    'chrome.google.com',
    'chromewebstore.google.com',
    'addons.mozilla.org'
  ];
  
  // プロトコルチェック
  if (restrictedProtocols.some(protocol => url.startsWith(protocol))) {
    return true;
  }
  
  // ドメインチェック
  try {
    const urlObj = new URL(url);
    if (restrictedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return true;
    }
  } catch {
    return true; // 無効なURL
  }
  
  return false;
}