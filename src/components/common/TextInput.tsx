interface TextInputProps {
  id: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onKeyPress?: (event: KeyboardEvent) => void;
  disabled?: boolean;
  className?: string;
  style?: Record<string, any>;
}

export const TextInput = ({ 
  id, 
  type = 'text', 
  value, 
  placeholder, 
  onChange, 
  onKeyPress, 
  disabled = false,
  className,
  style
}: TextInputProps) => {
  const defaultStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--border, #e2e8f0)',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'var(--surface, #f8fafc)',
    color: 'var(--text-primary)',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    ...style
  };

  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange((e.target as HTMLInputElement).value)}
      onKeyPress={onKeyPress}
      disabled={disabled}
      className={className}
      style={defaultStyle}
    />
  );
};