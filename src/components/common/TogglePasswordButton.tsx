import { EyeIcon } from '../icons/EyeIcon';

interface TogglePasswordButtonProps {
  isVisible: boolean;
  onToggle: () => void;
  size?: number;
  disabled?: boolean;
}

export const TogglePasswordButton = ({ 
  isVisible, 
  onToggle, 
  size = 20, 
  disabled = false 
}: TogglePasswordButtonProps) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.target as HTMLElement).style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
        }
      }}
      aria-label={isVisible ? 'Hide password' : 'Show password'}
      type="button"
    >
      <EyeIcon isVisible={isVisible} size={size} />
    </button>
  );
};