import type { ComponentChildren } from 'preact';

interface ButtonGroupProps {
  children: ComponentChildren;
  gap?: string;
  marginTop?: string;
}

export const ButtonGroup = ({ 
  children, 
  gap = '12px',
  marginTop = '24px'
}: ButtonGroupProps) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap, 
      marginTop 
    }}>
      {children}
    </div>
  );
};