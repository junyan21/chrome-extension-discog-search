import { useState, useEffect } from 'preact/hooks';
import { APISettings } from './APISettings';
import { useI18n } from '../../hooks/useI18n';

export const Options = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { getMessage, isJapanese } = useI18n();

  useEffect(() => {
    // Load saved API key and model
    chrome.storage.local.get(['geminiApiKey', 'selectedGeminiModel'], (result) => {
      if (result.geminiApiKey) {
        setApiKey(result.geminiApiKey);
      }
      if (result.selectedGeminiModel) {
        setModel(result.selectedGeminiModel);
      }
    });
  }, []);

  const showStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatus({ message, type });
    
    if (type !== 'error') {
      setTimeout(() => {
        setStatus(null);
      }, 3000);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      showStatus(getMessage('enterApiKey'), 'error');
      return;
    }
    
    if (!model.trim()) {
      showStatus(getMessage('enterModelName'), 'error');
      return;
    }

    setIsLoading(true);

    try {
      chrome.storage.local.set({ 
        geminiApiKey: apiKey.trim(),
        selectedGeminiModel: model.trim()
      }, () => {
        setIsLoading(false);
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          showStatus(getMessage('saveSettingsFailed'), 'error');
        } else {
          showStatus(getMessage('settingsSaved', model.trim()), 'success');
        }
      });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      showStatus('設定の保存に失敗しました', 'error');
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      showStatus(getMessage('enterApiKey'), 'error');
      return;
    }
    
    if (!model.trim()) {
      showStatus(getMessage('enterModelName'), 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Test using the specified model
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const genModel = genAI.getGenerativeModel({ model: model.trim() });
      
      const result = await genModel.generateContent('Test connection - respond with "OK"');
      const response = result.response;
      const text = response.text();
      
      if (text) {
        showStatus(getMessage('testSuccess', model.trim()), 'success');
      } else {
        showStatus(getMessage('testFailedCheckCredentials'), 'error');
      }
    } catch (error) {
      console.error('API test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        showStatus(getMessage('modelNotFound', model.trim()), 'error');
      } else if (errorMessage.includes('API key')) {
        showStatus(getMessage('invalidApiKey'), 'error');
      } else {
        showStatus(getMessage('testFailed', errorMessage), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div style={{ 
      width: '100%',
      maxWidth: '600px',
      padding: '40px 20px'
    }}>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '30px', textAlign: 'center' }}>
        {getMessage('optionsPageTitle')}
      </h1>
      
      <APISettings
        apiKey={apiKey}
        model={model}
        showPassword={showPassword}
        isLoading={isLoading}
        onApiKeyChange={setApiKey}
        onModelChange={setModel}
        onShowPasswordToggle={() => setShowPassword(!showPassword)}
        onSave={handleSave}
        onTest={handleTest}
        onKeyPress={handleKeyPress}
      />
      
      {status && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '500',
          marginTop: '1rem',
          backgroundColor: status.type === 'success' ? 'var(--success, #10b981)' : 
                         status.type === 'error' ? 'var(--error, #ef4444)' : 
                         'var(--surface, #f8fafc)',
          color: status.type === 'success' || status.type === 'error' ? 'white' : 'var(--primary, #8b5cf6)',
          border: status.type === 'info' ? '1px solid var(--primary, #8b5cf6)' : 'none'
        }}>
          {status.message}
        </div>
      )}
      
      <footer style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border, #e2e8f0)',
        textAlign: 'center'
      }}>
        <a 
          href={isJapanese() 
            ? 'https://junyan21.github.io/chrome-extension-vinyl-lens/' 
            : 'https://junyan21.github.io/chrome-extension-vinyl-lens/index-en'
          }
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--primary, #8b5cf6)',
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}
        >
          {getMessage('supportLinkText')}
        </a>
      </footer>
    </div>
  );
};