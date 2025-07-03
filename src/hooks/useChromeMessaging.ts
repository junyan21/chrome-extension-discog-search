import { useState, useCallback } from 'preact/hooks';

export interface ChromeMessage {
  action: string;
  content?: string;
  url?: string;
  [key: string]: any;
}

export interface ChromeResponse {
  success: boolean;
  result?: string;
  message?: string;
  [key: string]: any;
}

export const useChromeMessaging = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const sendMessage = useCallback(async (message: ChromeMessage): Promise<ChromeResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chrome.runtime.sendMessage(message);
      setLoading(false);
      return response;
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const sendTabMessage = useCallback(async (
    tabId: number, 
    message: ChromeMessage, 
    retryWithInjection = true
  ): Promise<ChromeResponse> => {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('コンテンツ抽出がタイムアウトしました'));
      }, 15000);

      chrome.tabs.sendMessage(tabId, message, async (response: ChromeResponse) => {
        if (chrome.runtime.lastError) {
          const errorMessage = chrome.runtime.lastError.message || '';
          
          if (errorMessage.includes('Receiving end does not exist') && retryWithInjection) {
            // Try to inject content script
            try {
              await chrome.scripting.executeScript({
                target: { tabId },
                files: ['assets/content.js']
              });

              await new Promise(res => setTimeout(res, 1500));

              chrome.tabs.sendMessage(tabId, message, (retryResponse: ChromeResponse) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                  reject(new Error('コンテンツスクリプトが正常に動作しません。ページをリロードしてから再度お試しください。'));
                } else if (retryResponse && retryResponse.success) {
                  resolve(retryResponse);
                } else {
                  reject(new Error(retryResponse?.message || 'コンテンツ抽出に失敗しました'));
                }
              });

            } catch (injectionError: any) {
              clearTimeout(timeout);
              if (injectionError.message.includes('Cannot access') || injectionError.message.includes('Cannot script')) {
                reject(new Error('このページでは拡張機能を使用できません。通常のWebページでお試しください。'));
              } else {
                reject(new Error('拡張機能が正常に動作しません。ページをリロードしてから再度お試しください。'));
              }
            }
          } else if (errorMessage.includes('Cannot access')) {
            clearTimeout(timeout);
            reject(new Error('このページでは拡張機能を使用できません。通常のWebページでお試しください。'));
          } else {
            clearTimeout(timeout);
            reject(new Error(`コンテンツスクリプトとの通信に失敗しました: ${errorMessage}`));
          }
        } else if (response && response.success) {
          clearTimeout(timeout);
          resolve(response);
        } else {
          clearTimeout(timeout);
          reject(new Error(response?.message || 'コンテンツ抽出に失敗しました'));
        }
      });
    });
  }, []);

  // Listen for progress messages
  const setupProgressListener = useCallback(() => {
    const listener = (message: any) => {
      if (message.type === 'progress') {
        setProgress(message.message);
      }
    };
    
    chrome.runtime.onMessage.addListener(listener);
    
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return {
    sendMessage,
    sendTabMessage,
    setupProgressListener,
    loading,
    error,
    progress,
    setProgress
  };
};