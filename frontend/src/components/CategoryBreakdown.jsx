export default function CategoryBreakdown({ results = [] }) {
  if (!results.length) {
    return (
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        No category results available.
      </p>
    );
  }

  return (
    <div>
      <p
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}
      >
        Category Breakdown
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
        }}
      >
        {results.map((result, idx) => {
          const isDetected = result.classification === 'detected';
          const badgeClass = isDetected ? 'badge-blocked' : 'badge-approved';

          return (
            <div
              key={`${result.category}-${idx}`}
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
              }}
            >
              {/* Category Name & Status */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {result.category}
                </span>
                <span className={`badge ${badgeClass}`}>
                  {isDetected ? 'Detected' : 'Clear'}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    background: 'var(--border-default)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${result.confidence}%`,
                      background: isDetected
                        ? 'var(--status-blocked)'
                        : 'var(--status-approved)',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>

              {/* Confidence Percentage */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                }}
              >
                <span>Confidence</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {result.confidence}%
                </span>
              </div>

              {/* Reasoning */}
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {result.reasoning}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
