interface GearIconProps {
  size?: number;
  color?: string;
}

export const GearIcon = ({ size = 20, color = 'var(--text-secondary)' }: GearIconProps) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        color: color,
        backgroundImage: `
          radial-gradient(transparent 0 35%, currentColor 35% 70%, transparent 70% 100%), 
          linear-gradient(to right, currentColor, currentColor)
        `,
        backgroundSize: '70% 70%, 25% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        transformOrigin: 'center',
      }}
    >
      <div
        style={{
          content: '',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(to right, currentColor, currentColor)',
          backgroundSize: '25% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          transformOrigin: 'center',
          transform: 'rotate(60deg)',
        }}
      />
      <div
        style={{
          content: '',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(to right, currentColor, currentColor)',
          backgroundSize: '25% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          transformOrigin: 'center',
          transform: 'rotate(120deg)',
        }}
      />
    </div>
  );
};