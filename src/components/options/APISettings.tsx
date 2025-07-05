import { FormField } from '../common/FormField';
import { TextInput } from '../common/TextInput';
import { PasswordInput } from '../common/PasswordInput';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { ButtonGroup } from '../common/ButtonGroup';
import { useI18n } from '../../hooks/useI18n';

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
  const { getMessage } = useI18n();

  return (
    <div>
      <FormField label={getMessage("geminiApiKeyLabel")} htmlFor="apiKey">
        <PasswordInput
          id="apiKey"
          value={apiKey}
          placeholder={getMessage("apiKeyPlaceholder")}
          showPassword={showPassword}
          onTogglePassword={onShowPasswordToggle}
          onChange={onApiKeyChange}
          onKeyPress={onKeyPress}
        />
      </FormField>

      <FormField 
        label={getMessage("geminiModelLabel")} 
        htmlFor="modelInput"
        helperText={getMessage("modelHelperText")}
      >
        <TextInput
          id="modelInput"
          value={model}
          placeholder={getMessage("modelPlaceholder")}
          onChange={onModelChange}
          onKeyPress={onKeyPress}
        />
      </FormField>

      <ButtonGroup>
        <PrimaryButton
          onClick={onSave}
          disabled={isLoading}
          loading={isLoading}
          loadingText={getMessage("saving")}
        >
          {getMessage("saveSettings")}
        </PrimaryButton>
        
        <SecondaryButton
          onClick={onTest}
          disabled={isLoading}
          loading={isLoading}
          loadingText={getMessage("testing")}
        >
          {getMessage("test")}
        </SecondaryButton>
      </ButtonGroup>
    </div>
  );
};