import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const extractAndProcessButton = document.getElementById('extractAndProcess') as HTMLButtonElement;
  const resultDiv = document.getElementById('result') as HTMLDivElement;

  extractAndProcessButton.addEventListener('click', async () => {
    resultDiv.textContent = 'Processing...';
    resultDiv.style.color = 'black';

    try {
      // Send message to content script to extract content
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        resultDiv.textContent = 'Error: No active tab found.';
        resultDiv.style.color = 'red';
        return;
      }

      const contentResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });

      if (!contentResponse || !contentResponse.success) {
        resultDiv.textContent = `Error extracting content: ${contentResponse?.message || 'Unknown error'}`;
        resultDiv.style.color = 'red';
        return;
      }

      // Send extracted content and URL to background script for LLM processing
      const llmResponse = await chrome.runtime.sendMessage({ action: 'processContent', content: contentResponse.content, url: contentResponse.url });
      console.log("Received response from background:", llmResponse);

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
        } catch (parseError: any) {
          console.error("JSON Parse Error:", parseError);
          resultDiv.textContent = `Error parsing LLM response: ${parseError.message || parseError}\nRaw response: ${llmResponse.result}`;
          resultDiv.style.color = 'red';
        }
      } else {
        resultDiv.textContent = `Error processing with LLM: ${llmResponse?.message || 'Unknown error'}`;
        resultDiv.style.color = 'red';
      }
    } catch (error: any) {
      console.error("Popup Error:", error);
      resultDiv.textContent = `An unexpected error occurred: ${error.message || error}`;
      resultDiv.style.color = 'red';
    }
  });
});