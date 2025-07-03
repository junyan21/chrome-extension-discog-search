import type { ComponentChildren } from 'preact';

interface PrimaryButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: ComponentChildren;
  className?: string;
}

export const PrimaryButton = ({ 
  onClick, 
  disabled = false, 
  loading = false,
  loadingText,
  children,
  className
}: PrimaryButtonProps) => {
  const isDisabled = disabled || loading;
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      style={{
        flex: 1,
        padding: '12px 24px',
        backgroundColor: isDisabled ? '#ccc' : 'var(--primary, #8b5cf6)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: isDisabled ? 0.7 : 1
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.target as HTMLElement).style.backgroundColor = 'var(--primary-dark, #7c3aed)';
          (e.target as HTMLElement).style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          (e.target as HTMLElement).style.backgroundColor = 'var(--primary, #8b5cf6)';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        }
      }}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
};