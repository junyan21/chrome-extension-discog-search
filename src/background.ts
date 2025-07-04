import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper function for i18n in background script
function getMessage(messageName: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(messageName, substitutions);
}

// Offscreenドキュメントの管理
let offscreenCreating: Promise<void> | null;

async function setupOffscreenDocument(path: string) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (offscreenCreating) {
    await offscreenCreating;
  } else {
    offscreenCreating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['DOM_PARSER'],
      justification: 'Parse HTML content using Readability',
    });
    await offscreenCreating;
    offscreenCreating = null;
  }
}

// 進捗メッセージを送信する関数
async function sendProgress(message: string) {
  console.log(`[Background] Progress: ${message}`);
  // 全てのタブにメッセージを送信
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'progress', message }).catch(() => {
        // タブが受信できない場合は無視
      });
    }
  });
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // この関数が非同期応答を返すことを示すフラグ
  const isAsyncResponse = request.action === 'processContent';

  if (isAsyncResponse) {
    (async () => {
      let responseData: { success: boolean; result?: string; message?: string } = { success: false, message: getMessage("unknownError") };
      const { content, url } = request; // URLも取得

      try {
        console.log('[Background] Processing content request');
        console.log(`[Background] Content URL: ${url}`);
        console.log(`[Background] Content length: ${content.length} characters`);
        
        await sendProgress(getMessage('checkingApiKey'));
        const result = await chrome.storage.local.get(['geminiApiKey', 'selectedGeminiModel']);
        const apiKey = result.geminiApiKey;
        const selectedModel = result.selectedGeminiModel;

        if (!apiKey) {
          responseData = { success: false, message: getMessage('apiKeyNotSet') };
        } else if (!selectedModel) {
          responseData = { success: false, message: getMessage('modelNotSelected') };
        } else {
          const genAI = new GoogleGenerativeAI(apiKey);
          let model;
          try {
            // Try to create model with selected model
            model = genAI.getGenerativeModel({ model: selectedModel });
            console.log(`[Background] Using Gemini model: ${selectedModel}`);
          } catch (error) {
            console.error(`[Background] Failed to initialize model ${selectedModel}:`, error);
            responseData = { 
              success: false, 
              message: getMessage('modelNotAvailable', selectedModel) 
            };
            sendResponse(responseData);
            return;
          }

          // ページコンテンツから音楽情報を抽出（ノイズ除去も含む）
          await sendProgress(getMessage('extractingMusicInfo'));
          console.log('[Background] Extracting music info from page content');
          const initialPrompt = `You are analyzing web page content to extract music information. The content may include navigation menus, advertisements, and other irrelevant text - please focus only on the main content about music.

From the following web page content (URL: ${url}), extract the primary artist and album/release/song title. Ignore any promotional text, navigation elements, social media widgets, advertisements, or other non-content elements.

Format your response as a JSON object with keys: artist, title. If information is not found, use null.

Example: { "artist": "Artist Name", "title": "Album/Song Title" }

Web page content:
${content}`;

          const initialResult = await model.generateContent(initialPrompt);
          const initialResponse = await initialResult.response;
          const initialText = initialResponse.text();
          console.log('[Background] AI response received:', initialText);

          let parsedInitialJson: { artist: string | null, title: string | null } | null = null;
          try {
            let jsonString = initialText.trim();
            if (jsonString.startsWith("```json")) {
              jsonString = jsonString.substring("```json".length, jsonString.lastIndexOf("```")).trim();
            }
            parsedInitialJson = JSON.parse(jsonString);
          } catch (e) {
            console.error("Failed to parse initial LLM response:", e);
            responseData = { success: false, message: `Failed to parse initial LLM response: ${e}` };
            sendResponse(responseData);
            return;
          }

          if (!parsedInitialJson || (!parsedInitialJson.artist && !parsedInitialJson.title)) {
            responseData = { success: false, message: getMessage('couldNotExtractInfo') };
            sendResponse(responseData);
            return;
          }

          const searchQuery = `site:discogs.com ${parsedInitialJson.artist || ''} ${parsedInitialJson.title || ''}`.trim();
          console.log('[Background] Google Search Query:', searchQuery);
          await sendProgress(getMessage('googleSearching', searchQuery));

          // Google検索を実行
          const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
          let googleHtml = '';
          try {
            const googleResponse = await fetch(googleSearchUrl);
            if (!googleResponse.ok) {
              throw new Error(`Google search failed: ${googleResponse.status} ${googleResponse.statusText}`);
            }
            googleHtml = await googleResponse.text();
          } catch (fetchError: any) {
            console.error('Failed to fetch Google search results:', fetchError);
            responseData = { success: false, message: getMessage('googleSearchFailed', fetchError.message) };
            sendResponse(responseData);
            return;
          }

          // Google検索結果からDiscogsのURLを抽出（正規表現を使用）
          await sendProgress(getMessage('lookingForDiscogs'));
          console.log('[Background] Extracting Discogs URL from search results');
          const discogsUrlMatch = googleHtml.match(/https?:\/\/(www\.)?discogs\.com\/[^"'\s<>]+/);
          const discogsUrl = discogsUrlMatch ? discogsUrlMatch[0] : null;

          if (!discogsUrl) {
            responseData = { success: false, message: getMessage('noDiscogsUrl') };
            sendResponse(responseData);
            return;
          }

          console.log('[Background] Found Discogs URL:', discogsUrl);
          await sendProgress(getMessage('fetchingDiscogs'));

          // DiscogsのページHTMLを取得
          let discogsHtml = '';
          try {
            const discogsResponse = await fetch(discogsUrl);
            if (!discogsResponse.ok) {
              throw new Error(`Discogs fetch failed: ${discogsResponse.status} ${discogsResponse.statusText}`);
            }
            discogsHtml = await discogsResponse.text();
          } catch (fetchError: any) {
            console.error('Failed to fetch Discogs page:', fetchError);
            responseData = { success: false, message: getMessage('fetchDiscogsFailed', fetchError.message) };
            sendResponse(responseData);
            return;
          }

          // Offscreenドキュメントを使ってReadabilityでコンテンツを抽出
          await sendProgress(getMessage('analyzingDiscogs'));
          console.log('[Background] Setting up offscreen document');
          await setupOffscreenDocument('public/offscreen.html');
          
          // Offscreenドキュメントに直接メッセージを送信
          const [offscreenDoc] = await chrome.runtime.getContexts({
            contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
            documentUrls: [chrome.runtime.getURL('public/offscreen.html')]
          });
          
          if (!offscreenDoc) {
            responseData = { success: false, message: getMessage('offscreenAccessError') };
            sendResponse(responseData);
            return;
          }
          
          // メッセージをOffscreenドキュメントに送信して応答を待つ
          const offscreenContentResponse = await new Promise<{ content: string | null }>((resolve) => {
            chrome.runtime.sendMessage({
              type: 'readability-extract',
              html: discogsHtml,
            }, (response) => {
              resolve(response);
            });
          });

          if (!offscreenContentResponse || !offscreenContentResponse.content) {
            responseData = { success: false, message: getMessage('discogsContentError') };
            sendResponse(responseData);
            return;
          }

          const discogsContent = offscreenContentResponse.content;
          console.log('[Background] Extracted Discogs Content:', discogsContent.substring(0, 500) + '...'); // 最初の500文字だけ表示
          await sendProgress(getMessage('extractingDetails'));

          // 抽出したDiscogsコンテンツをLLMに渡し、最終的な情報を取得
          const finalPrompt = `Given the following text from a Discogs page (URL: ${discogsUrl}), extract the artist, album/release title, year, any relevant catalog numbers or identifiers, and analyze the available formats.

Pay special attention to format information such as:
- Vinyl formats: Vinyl, LP, 12", 7", 45 RPM, EP (vinyl), Album (vinyl), Single (vinyl)
- Non-vinyl formats: CD, Digital, Cassette, Tape, MP3, FLAC, Streaming

Determine if this release is vinyl-only (only available in vinyl formats) or if it has other format options.

Format the output as a JSON object with keys: artist, title, year, identifiers, url, isVinylOnly, availableFormats.

- isVinylOnly: boolean (true if only vinyl formats are available, false if other formats exist)
- availableFormats: array of strings listing all detected formats

Example: { "artist": "Artist Name", "title": "Album Title", "year": 2023, "identifiers": "CAT-123", "url": "https://www.discogs.com/release/123-Artist-Title", "isVinylOnly": true, "availableFormats": ["Vinyl", "LP", "12\""] }

If a piece of information is not found, use null for strings/numbers or empty array for availableFormats.

Text: ${discogsContent}`;

          console.log('[Background] Extracting detailed info from Discogs page');
          const finalResult = await model.generateContent(finalPrompt);
          const finalResponse = await finalResult.response;
          const finalJsonText = finalResponse.text();
          console.log('[Background] Final AI response:', finalJsonText);

          await sendProgress(getMessage('processingCompleteMessage'));
          responseData = { success: true, result: finalJsonText };
        }
      } catch (error: any) {
        console.error('[Background] Script Error:', error);
        console.error('[Background] Error stack:', error.stack);
        responseData = { success: false, message: getMessage('backgroundScriptError', error.message || error) };
      } finally {
        // どのような結果であっても、必ずsendResponseを呼び出す
        console.log("Sending final response from background:", responseData);
        sendResponse(responseData);
      }
    })();
  }
  // 非同期応答が期待される場合はtrueを返す
  return isAsyncResponse;
});

console.log("background script loaded with Gemini API integration");