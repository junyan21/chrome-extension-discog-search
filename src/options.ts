document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const modelInput = document.getElementById('modelInput') as HTMLInputElement;
  const saveButton = document.getElementById('save') as HTMLButtonElement;
  const testButton = document.getElementById('test') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  const togglePasswordButton = document.getElementById('togglePassword') as HTMLButtonElement;
  const showIcon = document.getElementById('showIcon') as HTMLElement;
  const hideIcon = document.getElementById('hideIcon') as HTMLElement;

  // Load saved API key and selected model
  chrome.storage.local.get(['geminiApiKey', 'selectedGeminiModel'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
    if (result.selectedGeminiModel) {
      modelInput.value = result.selectedGeminiModel;
    }
  });

  // Toggle password visibility
  togglePasswordButton.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    showIcon.classList.toggle('hidden', !isPassword);
    hideIcon.classList.toggle('hidden', isPassword);
  });

  // Show status message with appropriate styling
  const showStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    statusDiv.className = `p-4 rounded-lg text-sm font-medium ${
      type === 'success' 
        ? 'bg-[var(--md-sys-color-success)] text-[var(--md-sys-color-on-success)]'
        : type === 'error'
        ? 'bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)]'
        : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
    }`;
    statusDiv.textContent = message;
    statusDiv.classList.remove('hidden');
    
    if (type !== 'error') {
      setTimeout(() => {
        statusDiv.classList.add('hidden');
      }, 3000);
    }
  };

  // Test API key and model functionality
  testButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const modelName = modelInput.value.trim();
    
    if (!apiKey) {
      showStatus('APIキーを入力してください', 'error');
      return;
    }
    
    if (!modelName) {
      showStatus('モデル名を入力してください', 'error');
      return;
    }

    testButton.disabled = true;
    testButton.textContent = 'テスト中...';
    
    try {
      // Test using the specified model
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Test connection - respond with "OK"');
      const response = result.response;
      const text = response.text();
      
      if (text) {
        showStatus(`✓ APIキーとモデル「${modelName}」が正常に動作しています！`, 'success');
      } else {
        showStatus('テストが失敗しました - APIキーとモデル名を確認してください', 'error');
      }
    } catch (error) {
      console.error('API test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        showStatus(`モデル「${modelName}」が見つかりません。正しいモデル名を入力してください。`, 'error');
      } else if (errorMessage.includes('API key')) {
        showStatus('APIキーが無効です。正しいAPIキーを入力してください。', 'error');
      } else {
        showStatus(`テストが失敗しました: ${errorMessage}`, 'error');
      }
    } finally {
      testButton.disabled = false;
      testButton.textContent = 'テスト';
    }
  });

  // Save API key and model with enhanced feedback
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const modelName = modelInput.value.trim();
    
    if (!apiKey) {
      showStatus('APIキーを入力してください', 'error');
      return;
    }
    
    if (!modelName) {
      showStatus('モデル名を入力してください', 'error');
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = '保存中...';

    try {
      chrome.storage.local.set({ 
        geminiApiKey: apiKey,
        selectedGeminiModel: modelName
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          showStatus('設定の保存に失敗しました', 'error');
        } else {
          showStatus(`✓ 設定を保存しました！使用モデル: ${modelName}`, 'success');
        }
        saveButton.disabled = false;
        saveButton.textContent = '設定を保存';
      });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      showStatus('設定の保存に失敗しました', 'error');
      saveButton.disabled = false;
      saveButton.textContent = '設定を保存';
    }
  });

  // Auto-save on Enter key
  apiKeyInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      saveButton.click();
    }
  });
  
  modelInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      saveButton.click();
    }
  });
});