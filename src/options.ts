document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
  const refreshModelsButton = document.getElementById('refreshModels') as HTMLButtonElement;
  const saveButton = document.getElementById('save') as HTMLButtonElement;
  const testButton = document.getElementById('test') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  const togglePasswordButton = document.getElementById('togglePassword') as HTMLButtonElement;
  const showIcon = document.getElementById('showIcon') as SVGElement;
  const hideIcon = document.getElementById('hideIcon') as SVGElement;

  // Load saved API key and selected model
  chrome.storage.local.get(['geminiApiKey', 'selectedGeminiModel'], async (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
      // Load models when API key is available, then set the selected model
      if (result.selectedGeminiModel) {
        await loadAvailableModels();
        modelSelect.value = result.selectedGeminiModel;
      } else {
        await loadAvailableModels();
      }
    }
  });

  // Toggle password visibility
  togglePasswordButton.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    showIcon.classList.toggle('hidden', !isPassword);
    hideIcon.classList.toggle('hidden', isPassword);
  });

  // Load models when API key changes (with debouncing to prevent excessive API calls)
  let debounceTimer: number;
  apiKeyInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const apiKey = apiKeyInput.value.trim();
      if (apiKey) {
        loadAvailableModels();
      } else {
        modelSelect.disabled = true;
        refreshModelsButton.disabled = true;
        modelSelect.innerHTML = '<option value="">Select a model...</option>';
      }
    }, 500); // 500ms debounce delay
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

  // Load available models dynamically with caching
  const loadAvailableModels = async (forceRefresh = false) => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key first', 'error');
      return;
    }

    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
      try {
        const cached = await new Promise<{modelCache?: {models: any[], timestamp: number, apiKeyHash: string}}>((resolve) => {
          chrome.storage.local.get(['modelCache'], resolve);
        });
        
        if (cached.modelCache) {
          const { models, timestamp, apiKeyHash } = cached.modelCache;
          const cacheAge = Date.now() - timestamp;
          const currentApiKeyHash = btoa(apiKey).slice(0, 8); // Simple hash for cache validation
          
          // Use cache if less than 1 hour old and same API key
          if (cacheAge < 60 * 60 * 1000 && apiKeyHash === currentApiKeyHash && models.length > 0) {
            populateModelDropdown(models);
            showStatus(`✓ Loaded ${models.length} compatible models (cached)`, 'success');
            return;
          }
        }
      } catch (error) {
        console.log('Cache read failed, fetching fresh models');
      }
    }

    try {
      modelSelect.disabled = true;
      refreshModelsButton.disabled = true;
      showStatus('Loading available models...', 'info');
      
      // Import Google Generative AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Get list of available models
      const result = await genAI.listModels();
      const models = result.models || [];
      
      // Filter only models that support generateContent
      const compatibleModels = models.filter(model => 
        model.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (compatibleModels.length === 0) {
        showStatus('No compatible models found', 'error');
        return;
      }
      
      // Cache the models
      try {
        const modelCache = {
          models: compatibleModels,
          timestamp: Date.now(),
          apiKeyHash: btoa(apiKey).slice(0, 8)
        };
        chrome.storage.local.set({ modelCache });
      } catch (error) {
        console.error('Failed to cache models:', error);
      }
      
      populateModelDropdown(compatibleModels);
      showStatus(`✓ Loaded ${compatibleModels.length} compatible models`, 'success');
      
    } catch (error) {
      console.error('Failed to load models:', error);
      showStatus('Failed to load models - please check your API key', 'error');
      modelSelect.disabled = true;
      refreshModelsButton.disabled = true;
    }
  };
  
  // Helper function to populate model dropdown
  const populateModelDropdown = (models: any[]) => {
    // Clear and populate model dropdown
    modelSelect.innerHTML = '';
    
    models.forEach((model, index) => {
      const option = document.createElement('option');
      option.value = model.name;
      option.textContent = model.name;
      modelSelect.appendChild(option);
      
      // Select first model as default
      if (index === 0) {
        option.selected = true;
      }
    });
    
    modelSelect.disabled = false;
    refreshModelsButton.disabled = false;
  };

  // Refresh models button (force refresh to bypass cache)
  refreshModelsButton.addEventListener('click', () => loadAvailableModels(true));

  // Test API key functionality with dynamic model selection
  testButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const selectedModel = modelSelect.value;
    
    if (!apiKey) {
      showStatus('Please enter an API key first', 'error');
      return;
    }
    
    if (!selectedModel) {
      showStatus('Please select a model first', 'error');
      return;
    }

    testButton.disabled = true;
    testButton.textContent = 'Testing...';
    
    try {
      // Test using the selected model
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });
      
      const result = await model.generateContent('Test connection - respond with "OK"');
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        showStatus(`✓ API key is valid and ${selectedModel} is working!`, 'success');
      } else {
        showStatus('API key test failed - please check your key', 'error');
      }
    } catch (error) {
      console.error('API test failed:', error);
      showStatus('API key test failed - please check your key and model selection', 'error');
    } finally {
      testButton.disabled = false;
      testButton.textContent = 'Test';
    }
  });

  // Save API key and selected model with enhanced feedback
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const selectedModel = modelSelect.value;
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }
    
    if (!selectedModel) {
      showStatus('Please select a model', 'error');
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    try {
      chrome.storage.local.set({ 
        geminiApiKey: apiKey,
        selectedGeminiModel: selectedModel
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          showStatus('Failed to save configuration', 'error');
        } else {
          showStatus(`✓ Configuration saved! Using model: ${selectedModel}`, 'success');
        }
        saveButton.disabled = false;
        saveButton.textContent = 'Save Configuration';
      });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      showStatus('Failed to save configuration', 'error');
      saveButton.disabled = false;
      saveButton.textContent = 'Save Configuration';
    }
  });

  // Auto-save on Enter key
  apiKeyInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      saveButton.click();
    }
  });
});