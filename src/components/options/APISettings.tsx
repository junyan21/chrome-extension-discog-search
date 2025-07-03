import { FormField } from '../common/FormField';
import { TextInput } from '../common/TextInput';
import { PasswordInput } from '../common/PasswordInput';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { ButtonGroup } from '../common/ButtonGroup';

interface APISettingsProps {
  apiKey: string;
  model: string;
  showPassword: boolean;
  isLoading: boolean;
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onShowPasswordToggle: () => void;
  onSave: () => void;
  onTest: () => void;
  onKeyPress: (event: KeyboardEvent) => void;
}

export const APISettings = ({
  apiKey,
  model,
  showPassword,
  isLoading,
  onApiKeyChange,
  onModelChange,
  onShowPasswordToggle,
  onSave,
  onTest,
  onKeyPress
}: APISettingsProps) => {
  return (
    <div>
      <FormField label="Google Gemini API Key:" htmlFor="apiKey">
        <PasswordInput
          id="apiKey"
          value={apiKey}
          placeholder="Enter your Gemini API key"
          showPassword={showPassword}
          onTogglePassword={onShowPasswordToggle}
          onChange={onApiKeyChange}
          onKeyPress={onKeyPress}
        />
      </FormField>

      <FormField 
        label="Gemini Model:" 
        htmlFor="modelInput"
        helperText="例: gemini-1.5-flash, gemini-1.5-pro など"
      >
        <TextInput
          id="modelInput"
          value={model}
          placeholder="gemini-1.5-flash"
          onChange={onModelChange}
          onKeyPress={onKeyPress}
        />
      </FormField>

      <ButtonGroup>
        <PrimaryButton
          onClick={onSave}
          disabled={isLoading}
          loading={isLoading}
          loadingText="保存中..."
        >
          設定を保存
        </PrimaryButton>
        
        <SecondaryButton
          onClick={onTest}
          disabled={isLoading}
          loading={isLoading}
          loadingText="テスト中..."
        >
          テスト
        </SecondaryButton>
      </ButtonGroup>
    </div>
  );
};