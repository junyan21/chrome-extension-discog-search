import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const extractAndProcessButton = document.getElementById('extractAndProcess') as HTMLButtonElement;
  const resultDiv = document.getElementById('result') as HTMLDivElement;
  const progressDiv = document.getElementById('progress') as HTMLDivElement;
  const progressMessageDiv = document.getElementById('progressMessage') as HTMLDivElement;

  // URL制限チェック関数
  function isRestrictedUrl(url: string): boolean {
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

  // コンテンツスクリプトと直接通信（フォールバック注入付き）
  async function extractContentDirectly(tabId: number, url: string): Promise<{success: boolean, content?: string, url?: string, message?: string}> {
    // URL制限チェック
    if (isRestrictedUrl(url)) {
      throw new Error('このページでは拡張機能を使用できません。通常のWebページ（http://またはhttps://）でお試しください。');
    }

    // まずコンテンツスクリプトに直接メッセージを送信
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('コンテンツ抽出がタイムアウトしました'));
      }, 15000);

      // 最初に既存のコンテンツスクリプトに試行
      chrome.tabs.sendMessage(tabId, {
        action: 'extractContent'
      }, async (response: {success: boolean, content?: string, url?: string, message?: string}) => {
        if (chrome.runtime.lastError) {
          const errorMessage = chrome.runtime.lastError.message || '';
          if (errorMessage.includes('Receiving end does not exist')) {
            // コンテンツスクリプトが存在しない場合、フォールバック注入を試行
            console.log('[Main] Content script not found, attempting injection...');
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['assets/content.js']
              });

              // 短い待機時間後に抽出リクエストを送信
              console.log('[Main] Content script injected, waiting briefly before extraction...');
              await new Promise(resolve => setTimeout(resolve, 1500));

              // 抽出リクエストを送信
              chrome.tabs.sendMessage(tabId, {
                action: 'extractContent'
              }, (retryResponse: {success: boolean, content?: string, url?: string, message?: string}) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                  // 動的注入でも失敗した場合は、ページリロードを推奨
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
                reject(new Error(`拡張機能が正常に動作しません。ページをリロードしてから再度お試しください。`));
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
  }

  // 進捗メッセージを更新する関数
  function updateProgress(message: string) {
    console.log(`[Progress] ${message}`);
    progressMessageDiv.textContent = message;
  }

  // 進捗状況をリッスンする
  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'progress') {
      updateProgress(message.message);
    }
  });

  extractAndProcessButton.addEventListener('click', async () => {
    console.log('[Main] Extract & Process button clicked');
    const startTime = performance.now();
    
    // UIをリセット
    resultDiv.textContent = '';
    resultDiv.style.color = 'black';
    progressDiv.style.display = 'block';
    updateProgress('初期化中...');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        resultDiv.textContent = 'Error: No active tab found.';
        resultDiv.style.color = 'red';
        return;
      }

      // コンテンツスクリプトと直接通信してコンテンツを抽出
      updateProgress('ページコンテンツを抽出中...');
      console.log('[Main] Extracting content directly from content script');
      console.log(`[Main] Target tab: ${tab.id}, URL: ${tab.url}`);
      
      let contentResponse;
      try {
        contentResponse = await extractContentDirectly(tab.id, tab.url || '');
        console.log('[Main] Content extraction response:', contentResponse);
      } catch (error: any) {
        console.error('[Main] Failed to extract content:', error);
        resultDiv.textContent = `Error: ${error.message}`;
        resultDiv.style.color = 'red';
        progressDiv.style.display = 'none';
        return;
      }

      if (!contentResponse || !contentResponse.success) {
        resultDiv.textContent = `Error extracting content: ${contentResponse?.message || 'Unknown error'}`;
        resultDiv.style.color = 'red';
        return;
      }

      // バックグラウンドスクリプトでAI処理を実行
      updateProgress('AI処理を開始しています...');
      console.log('[Main] Sending content to background for AI processing');
      if (!contentResponse.content) {
        resultDiv.textContent = 'Error: 抽出されたコンテンツが空です';
        resultDiv.style.color = 'red';
        progressDiv.style.display = 'none';
        return;
      }
      console.log(`[Main] Content length: ${contentResponse.content.length} characters`);
      const llmResponse = await chrome.runtime.sendMessage({ action: 'processContent', content: contentResponse.content, url: contentResponse.url });
      console.log('[Main] Received response from background:', llmResponse);

      if (llmResponse) {
        console.log("llmResponse.success:", llmResponse.success);
        console.log("llmResponse.message:", llmResponse.message);
        console.log("llmResponse.result:", llmResponse.result);
      }

      if (llmResponse && llmResponse.success && llmResponse.result) {
        try {
          // LLMの応答がMarkdownのコードブロック形式で返ってくる場合を考慮
          let jsonString = llmResponse.result.trim();
          if (jsonString.startsWith("```json")) {
            jsonString = jsonString.substring("```json".length, jsonString.lastIndexOf("```")).trim();
          }

          const parsedJson = JSON.parse(jsonString);
          let displayContent = `<pre>${JSON.stringify(parsedJson, null, 2)}</pre>`;

          // URLが存在すればリンクとして追加
          if (parsedJson.url) {
            displayContent += `<p><a href="${parsedJson.url}" target="_blank">Go to Discogs Page</a></p>`;
          }

          resultDiv.innerHTML = displayContent;
          resultDiv.style.color = 'green';
          
          const endTime = performance.now();
          const processingTime = ((endTime - startTime) / 1000).toFixed(2);
          console.log(`[Main] Processing completed in ${processingTime} seconds`);
          updateProgress(`処理完了！ (${processingTime}秒)`);
        } catch (parseError: any) {
          console.error('[Main] JSON Parse Error:', parseError);
          resultDiv.textContent = `Error parsing LLM response: ${parseError.message || parseError}\nRaw response: ${llmResponse.result}`;
          resultDiv.style.color = 'red';
        }
      } else {
        resultDiv.textContent = `Error processing with LLM: ${llmResponse?.message || 'Unknown error'}`;
        resultDiv.style.color = 'red';
        progressDiv.style.display = 'none';
      }
    } catch (error: any) {
      console.error('[Main] Popup Error:', error);
      resultDiv.textContent = `An unexpected error occurred: ${error.message || error}`;
      resultDiv.style.color = 'red';
      progressDiv.style.display = 'none';
    }
  });
});
