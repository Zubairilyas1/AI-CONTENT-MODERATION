import CategoryBreakdown from './CategoryBreakdown';

const getOutcomeBadgeClass = (outcome) => {
  switch (outcome) {
    case 'Approved':
      return 'badge-approved';
    case 'Flagged for Review':
      return 'badge-flagged';
    case 'Blocked':
      return 'badge-blocked';
    default:
      return 'badge-pending';
  }
};

export default function VerdictCard({ image, verdict, showImage = true }) {
  if (!verdict) return null;

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        padding: '16px',
        transition: 'all 0.15s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexDirection: 'row',
        }}
      >
        {/* Image Thumbnail */}
        {showImage && image?.file_path && (
          <img
            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${image.file_path}`}
            alt="Submitted content"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '8px',
              flexShrink: 0,
              border: '1px solid var(--border-default)',
            }}
          />
        )}

        {/* Verdict Info */}
        <div style={{ flex: 1 }}>
          {/* Verdict Badge */}
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              Verdict:
            </span>
            <span className={`badge ${getOutcomeBadgeClass(verdict.outcome)}`}>
              {verdict.outcome}
            </span>
          </div>

          {/* Category Breakdown */}
          <CategoryBreakdown results={verdict.category_results} />

          {/* Timestamp */}
          <p
            style={{
              marginTop: '12px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            Screened {new Date(verdict.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          div {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
