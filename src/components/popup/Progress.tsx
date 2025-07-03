interface ProgressProps {
  message: string;
}

export const Progress = ({ message }: ProgressProps) => {
  return (
    <div id="progress" style={{ marginTop: '20px', textAlign: 'center' }}>
      <div className="record-player">
        <div className="record">
          <div className="record-grooves"></div>
        </div>
      </div>
      <div 
        id="progressMessage" 
        style={{ 
          marginTop: '10px', 
          fontSize: '14px', 
          color: 'var(--text-secondary)' 
        }}
      >
        {message}
      </div>
    </div>
  );
};