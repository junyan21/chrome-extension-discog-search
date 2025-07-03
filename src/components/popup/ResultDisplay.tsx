import type { DiscogsResult } from './App';

interface ResultDisplayProps {
  result: DiscogsResult;
}

export const ResultDisplay = ({ result }: ResultDisplayProps) => {
  return (
    <div id="result" style={{ marginTop: '20px' }}>
      {result.isVinylOnly !== undefined && (
        <div style={{
          background: result.isVinylOnly ? '#2d5a2d' : '#5a2d2d',
          color: 'white',
          padding: '10px',
          margin: '5px 0',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}>
          {result.isVinylOnly ? '🎵 VINYL ONLY RELEASE' : '📀 MULTIPLE FORMATS AVAILABLE'}
        </div>
      )}
      
      {result.availableFormats && result.availableFormats.length > 0 && (
        <div style={{ margin: '5px 0' }}>
          <strong>Available Formats:</strong> {result.availableFormats.join(', ')}
        </div>
      )}
      
      <pre style={{
        background: 'var(--bg-secondary)',
        padding: '10px',
        borderRadius: '5px',
        overflow: 'auto',
        fontSize: '12px',
        color: 'var(--text-primary)'
      }}>
        {JSON.stringify(result, null, 2)}
      </pre>
      
      {result.url && (
        <p style={{ marginTop: '10px' }}>
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: 'var(--primary)',
              textDecoration: 'none'
            }}
          >
            Go to Discogs Page
          </a>
        </p>
      )}
    </div>
  );
};