interface EyeIconProps {
  isVisible: boolean;
  size?: number;
  color?: string;
}

export const EyeIcon = ({ isVisible, size = 20, color = 'var(--text-secondary)' }: EyeIconProps) => {
  if (isVisible) {
    // Eye closed (hide) icon
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
        <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22z"/>
        <path 
          fill-rule="evenodd" 
          d="M10 4C6.69 4 3.82 6.02 2.458 9c.653 1.43 1.615 2.61 2.807 3.47L3.28 14.46a.75.75 0 101.06 1.06l1.985-1.985C7.69 14.48 8.81 15 10 15s2.31-.52 3.675-1.465l1.985 1.985a.75.75 0 101.06-1.06l-1.985-1.985C15.927 11.61 16.89 10.43 17.542 9 16.18 6.02 13.31 4 10 4zm2.805 8.805A2 2 0 1112.805 7.195l4.39 4.39z" 
          clip-rule="evenodd"
        />
      </svg>
    );
  } else {
    // Eye open (show) icon
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
        <path 
          fill-rule="evenodd" 
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" 
          clip-rule="evenodd"
        />
      </svg>
    );
  }
};