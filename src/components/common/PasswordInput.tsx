import { TextInput } from './TextInput';
import { TogglePasswordButton } from './TogglePasswordButton';

interface PasswordInputProps {
  id: string;
  value: string;
  placeholder?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: (value: string) => void;
  onKeyPress?: (event: KeyboardEvent) => void;
  disabled?: boolean;
}

export const PasswordInput = ({ 
  id,
  value,
  placeholder,
  showPassword,
  onTogglePassword,
  onChange,
  onKeyPress,
  disabled = false
}: PasswordInputProps) => {
  return (
    <div style={{ position: 'relative' }}>
      <TextInput
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyPress={onKeyPress}
        disabled={disabled}
        style={{
          paddingRight: '50px' // Make room for the toggle button
        }}
      />
      <TogglePasswordButton
        isVisible={showPassword}
        onToggle={onTogglePassword}
        disabled={disabled}
      />
    </div>
  );
};