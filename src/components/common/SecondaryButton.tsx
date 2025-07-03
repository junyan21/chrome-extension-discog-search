import type { ComponentChildren } from 'preact';

interface SecondaryButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: ComponentChildren;
  className?: string;
}

export const SecondaryButton = ({ 
  onClick, 
  disabled = false, 
  loading = false,
  loadingText,
  children,
  className
}: SecondaryButtonProps) => {
  const isDisabled = disabled || loading;
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      style={{
        flex: 1,
        padding: '12px 24px',
        backgroundColor: isDisabled ? '#ccc' : 'transparent',
        color: isDisabled ? '#999' : 'var(--primary, #8b5cf6)',
        border: `1px solid ${isDisabled ? '#ccc' : 'var(--primary, #8b5cf6)'}`,
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: isDisabled ? 0.7 : 1
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.target as HTMLElement).style.backgroundColor = 'var(--primary, #8b5cf6)';
          (e.target as HTMLElement).style.color = 'white';
          (e.target as HTMLElement).style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
          (e.target as HTMLElement).style.color = 'var(--primary, #8b5cf6)';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        }
      }}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
};