import { GoogleGenerativeAI } from '@google/generative-ai';

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // この関数が非同期応答を返すことを示すフラグ
  const isAsyncResponse = request.action === 'processContent';

  if (isAsyncResponse) {
    (async () => {
      let responseData: { success: boolean; result?: string; message?: string } = { success: false, message: "An unknown error occurred." };
      const { content, url } = request; // URLも取得

      try {
        const result = await chrome.storage.local.get(['geminiApiKey']);
        const apiKey = result.geminiApiKey;

        if (!apiKey) {
          responseData = { success: false, message: 'Gemini API Key not set. Please set it in the extension options.' };
        } else {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

          // プロンプトにURLを含め、JSON出力にurlフィールドを追加するように指示
          const prompt = `Given the following text from a web page (URL: ${url}), extract the artist, album/release title, and if available, the year and any relevant catalog numbers or identifiers. Also, include the URL of the page. Format the output as a JSON object with keys: artist, title, year, identifiers, url. If a piece of information is not found, use null. Example: { "artist": "Artist Name", "title": "Album Title", "year": 2023, "identifiers": "CAT-123", "url": "https://www.discogs.com/release/123-Artist-Title" }\n\nText: ${content}`;

          const apiResult = await model.generateContent(prompt);
          const apiResponse = await apiResult.response;
          const text = apiResponse.text();
          responseData = { success: true, result: text };
        }
      } catch (error: any) {
        console.error("Gemini API Error:", error);
        responseData = { success: false, message: `Gemini API Error: ${error.message || error}` };
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