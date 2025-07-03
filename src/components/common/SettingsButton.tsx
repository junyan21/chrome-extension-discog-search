import { GearIcon } from '../icons/GearIcon';

interface SettingsButtonProps {
  onClick: () => void;
  className?: string;
  size?: number;
  disabled?: boolean;
}

export const SettingsButton = ({ 
  onClick, 
  className, 
  size = 20, 
  disabled = false 
}: SettingsButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '5px',
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
      aria-label="Settings"
      type="button"
    >
      <GearIcon size={size} />
    </button>
  );
};