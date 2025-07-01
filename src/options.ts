document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const saveButton = document.getElementById('save') as HTMLButtonElement;
  const testButton = document.getElementById('test') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  const togglePasswordButton = document.getElementById('togglePassword') as HTMLButtonElement;
  const showIcon = document.getElementById('showIcon') as SVGElement;
  const hideIcon = document.getElementById('hideIcon') as SVGElement;

  // Load saved API key
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
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

  // Test API key functionality
  testButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key first', 'error');
      return;
    }

    testButton.disabled = true;
    testButton.textContent = 'Testing...';
    
    try {
      // Simple test using Google Generative AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent('Test connection - respond with "OK"');
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        showStatus('✓ API key is valid and working!', 'success');
      } else {
        showStatus('API key test failed - please check your key', 'error');
      }
    } catch (error) {
      console.error('API test failed:', error);
      showStatus('API key test failed - please check your key', 'error');
    } finally {
      testButton.disabled = false;
      testButton.textContent = 'Test';
    }
  });

  // Save API key with enhanced feedback
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
      saveButton.disabled = false;
      saveButton.textContent = 'Save Configuration';
      showStatus('✓ API key saved successfully!', 'success');
    });
  });

  // Auto-save on Enter key
  apiKeyInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      saveButton.click();
    }
  });
});
