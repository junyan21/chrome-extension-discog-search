// Type definitions for Gemini models
interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  supportedGenerationMethods?: string[];
  inputModalities?: string[];
  outputModalities?: string[];
  recommendedUseCases?: string[];
}

interface ModelCache {
  models: GeminiModel[];
  timestamp: number;
}

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
  const refreshModelsButton = document.getElementById('refreshModels') as HTMLButtonElement;
  const saveButton = document.getElementById('save') as HTMLButtonElement;
  const testButton = document.getElementById('test') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  const togglePasswordButton = document.getElementById('togglePassword') as HTMLButtonElement;
  const showIcon = document.getElementById('showIcon') as HTMLElement;
  const hideIcon = document.getElementById('hideIcon') as HTMLElement;

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
        const cached = await new Promise<{modelCache?: ModelCache}>((resolve) => {
          chrome.storage.local.get(['modelCache'], (result) => resolve(result as {modelCache?: ModelCache}));
        });
        
        if (cached.modelCache) {
          const { models, timestamp } = cached.modelCache;
          const cacheAge = Date.now() - timestamp;
          
          // Use cache if less than 1 hour old
          if (cacheAge < 60 * 60 * 1000 && models.length > 0) {
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
      showStatus('Loading available models from Gemini documentation...', 'info');
      
      // Fetch models from Gemini documentation
      const response = await fetch('https://ai.google.dev/gemini-api/docs/models');
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Parse models from the documentation page
      const models = parseModelsFromDocs(html);
      
      // Filter only models that support text generation (exclude audio/image-only models)
      const compatibleModels = models.filter(model => {
        const hasTextInput = !model.inputModalities || model.inputModalities.includes('text');
        const hasTextOutput = !model.outputModalities || model.outputModalities.includes('text');
        const supportsGenerateContent = !model.supportedGenerationMethods || 
          model.supportedGenerationMethods.includes('generateContent');
        
        // Exclude models that are specifically for audio or image generation only
        const isNotAudioOnly = !model.name.toLowerCase().includes('audio-only');
        const isNotImageOnly = !model.name.toLowerCase().includes('imagen');
        
        return hasTextInput && hasTextOutput && supportsGenerateContent && isNotAudioOnly && isNotImageOnly;
      });
      
      if (compatibleModels.length === 0) {
        showStatus('No compatible text generation models found. Please enter model name manually.', 'error');
        // Show manual input field
        showManualModelInput();
        return;
      }
      
      // Cache the models
      try {
        const modelCache: ModelCache = {
          models: compatibleModels,
          timestamp: Date.now()
        };
        chrome.storage.local.set({ modelCache });
      } catch (error) {
        console.error('Failed to cache models:', error);
      }
      
      populateModelDropdown(compatibleModels);
      showStatus(`✓ Loaded ${compatibleModels.length} compatible models`, 'success');
      
    } catch (error) {
      console.error('Failed to load models:', error);
      showStatus('Failed to load models. Please enter model name manually.', 'error');
      showManualModelInput();
    }
  };
  
  // Parse models from Gemini documentation HTML
  const parseModelsFromDocs = (html: string): GeminiModel[] => {
    const models: GeminiModel[] = [];
    
    // This is a simplified parser - in production, you might want to use a more robust approach
    // Look for model information in the documentation structure
    const modelPattern = /gemini-[\w\d.-]+/gi;
    const matches = html.match(modelPattern);
    
    if (matches) {
      const uniqueModels = [...new Set(matches)];
      uniqueModels.forEach(modelName => {
        // Extract model info based on common patterns in the documentation
        const model: GeminiModel = {
          name: modelName,
          displayName: modelName,
          description: getModelDescription(modelName),
          supportedGenerationMethods: ['generateContent'],
          inputModalities: ['text'],
          outputModalities: ['text']
        };
        models.push(model);
      });
    }
    
    return models;
  };
  
  // Get model description based on model name
  const getModelDescription = (modelName: string): string => {
    const lowerName = modelName.toLowerCase();
    
    if (lowerName.includes('2.5-pro')) {
      return '最も強力な思考モデル。複雑なコーディング、高度な推論、マルチモーダル理解に最適';
    } else if (lowerName.includes('2.5-flash')) {
      return '価格とパフォーマンスのバランスが最も良いモデル。汎用的な使用に推奨';
    } else if (lowerName.includes('2.5-flash-lite')) {
      return 'コスト効率と低レイテンシに最適化。リアルタイムアプリケーションに最適';
    } else if (lowerName.includes('2.0-flash')) {
      return '次世代機能を備えた高速モデル。大きなコンテキストウィンドウ処理に適している';
    } else if (lowerName.includes('1.5-flash')) {
      return '高速で効率的なモデル。一般的なタスクに適している';
    } else if (lowerName.includes('1.5-pro')) {
      return '高度なタスクに適した強力なモデル';
    }
    
    return 'Gemini AIモデル';
  };
  
  // Show manual model input field
  const showManualModelInput = () => {
    // Enable manual input in model select or show a text input
    modelSelect.disabled = false;
    refreshModelsButton.disabled = false;
    
    // Add a manual input option
    modelSelect.innerHTML = '<option value="">Enter model name manually...</option>';
    
    // Create manual input field if not exists
    let manualInput = document.getElementById('manualModelInput') as HTMLInputElement;
    if (!manualInput) {
      manualInput = document.createElement('input');
      manualInput.id = 'manualModelInput';
      manualInput.type = 'text';
      manualInput.placeholder = 'e.g., gemini-2.5-flash';
      manualInput.className = 'w-full px-4 py-2 mt-2 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline)] rounded-lg text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)] focus:border-2';
      
      // Insert after model select
      modelSelect.parentElement?.appendChild(manualInput);
      
      // Update model select when manual input changes
      manualInput.addEventListener('input', () => {
        const value = manualInput.value.trim();
        if (value) {
          // Add or update the manual option
          let manualOption = modelSelect.querySelector('option[data-manual="true"]') as HTMLOptionElement;
          if (!manualOption) {
            manualOption = document.createElement('option');
            manualOption.setAttribute('data-manual', 'true');
            modelSelect.appendChild(manualOption);
          }
          manualOption.value = value;
          manualOption.textContent = value;
          manualOption.selected = true;
        }
      });
    }
    
    manualInput.classList.remove('hidden');
  };
  
  // Helper function to populate model dropdown
  const populateModelDropdown = (models: GeminiModel[]) => {
    // Clear and populate model dropdown
    modelSelect.innerHTML = '';
    
    // Hide manual input if it exists
    const manualInput = document.getElementById('manualModelInput');
    if (manualInput) {
      manualInput.classList.add('hidden');
    }
    
    models.forEach((model, index) => {
      const option = document.createElement('option');
      option.value = model.name;
      option.textContent = model.displayName || model.name;
      option.title = model.description; // Show description as tooltip
      modelSelect.appendChild(option);
      
      // Select gemini-2.5-flash as default if available, otherwise first model
      if (model.name.toLowerCase().includes('2.5-flash') && !model.name.toLowerCase().includes('lite')) {
        option.selected = true;
      } else if (index === 0 && !modelSelect.value) {
        option.selected = true;
      }
    });
    
    // Update model description display
    updateModelDescription();
    
    modelSelect.disabled = false;
    refreshModelsButton.disabled = false;
  };
  
  // Update model description display
  const updateModelDescription = () => {
    const selectedOption = modelSelect.options[modelSelect.selectedIndex];
    if (selectedOption && selectedOption.title) {
      // Find or create description element
      let descriptionDiv = document.getElementById('modelDescription');
      if (!descriptionDiv) {
        descriptionDiv = document.createElement('div');
        descriptionDiv.id = 'modelDescription';
        descriptionDiv.className = 'mt-2 p-3 bg-[var(--md-sys-color-surface-container)] rounded-lg text-sm text-[var(--md-sys-color-on-surface-variant)]';
        
        // Find the parent container of model select
        const modelSelectContainer = modelSelect.closest('.relative');
        if (modelSelectContainer && modelSelectContainer.parentElement) {
          // Insert after the model help text
          const helpText = modelSelectContainer.nextElementSibling;
          if (helpText) {
            helpText.insertAdjacentElement('afterend', descriptionDiv);
          } else {
            modelSelectContainer.parentElement.appendChild(descriptionDiv);
          }
        }
      }
      
      descriptionDiv.textContent = selectedOption.title;
      descriptionDiv.classList.remove('hidden');
    }
  };
  
  // Add model select change listener
  modelSelect.addEventListener('change', updateModelDescription);

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
  
  // Handle manual model input on Enter key
  const handleManualModelInput = () => {
    const manualInput = document.getElementById('manualModelInput') as HTMLInputElement;
    if (manualInput) {
      manualInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          const value = manualInput.value.trim();
          if (value) {
            modelSelect.value = value;
            updateModelDescription();
            saveButton.click();
          }
        }
      });
    }
  };
  
  // Initialize manual input handler when DOM is ready
  setTimeout(handleManualModelInput, 100);
});