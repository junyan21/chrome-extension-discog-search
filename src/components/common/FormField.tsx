import type { ComponentChildren } from 'preact';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ComponentChildren;
  helperText?: string;
}

export const FormField = ({ label, htmlFor, children, helperText }: FormFieldProps) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label 
        for={htmlFor}
        style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '500',
          color: 'var(--text-primary)' 
        }}
      >
        {label}
      </label>
      {children}
      {helperText && (
        <p style={{ 
          fontSize: '12px', 
          color: 'var(--text-secondary)', 
          marginTop: '4px',
          margin: '4px 0 0 0'
        }}>
          {helperText}
        </p>
      )}
    </div>
  );
};