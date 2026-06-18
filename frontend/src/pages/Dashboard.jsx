import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VerdictCard from '../components/VerdictCard';
import api from '../api/axios';

const CATEGORIES = [
  'Graphic Violence',
  'Hate Symbols',
  'Self-Harm',
  'Extremist Propaganda',
  'Weapons & Contraband',
  'Harassment & Humiliation',
];

const OUTCOMES = ['Approved', 'Flagged for Review', 'Blocked'];

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    outcome: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.outcome) params.outcome = filters.outcome;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const { data } = await api.get('/submissions', { params });
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  const getSubmissionOutcome = (sub) => {
    const outcomes = sub.images
      .map((img) => img.verdict_id?.outcome)
      .filter(Boolean);
    if (outcomes.includes('Blocked')) return 'Blocked';
    if (outcomes.includes('Flagged for Review')) return 'Flagged for Review';
    return 'Approved';
  };

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

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container fade-in">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
          }}
        >
          <div>
            <h1 className="page-title">Submissions</h1>
            <p className="page-subtitle">Your image moderation history</p>
          </div>
          <Link
            to="/submit"
            className="btn btn-primary"
          >
            + New Submission
          </Link>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Outcome
            </label>
            <select
              value={filters.outcome}
              onChange={(e) => setFilters({ ...filters, outcome: e.target.value })}
              className="input"
              style={{ fontSize: '13px' }}
            >
              <option value="">All</option>
              {OUTCOMES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input"
              style={{ fontSize: '13px' }}
            >
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input"
              style={{ fontSize: '13px' }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '3px solid var(--border-default)',
                borderTopColor: 'var(--accent)',
                margin: '0 auto',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : submissions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-default)',
              borderRadius: '10px',
            }}
          >
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              No submissions yet
            </p>
            <Link to="/submit" className="btn btn-primary btn-sm">
              Submit your first image
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {submissions.map((sub) => {
              const outcome = getSubmissionOutcome(sub);
              const canAppeal =
                (outcome === 'Blocked' || outcome === 'Flagged for Review') &&
                (!sub.appeal || sub.appeal.status === 'Rejected');

              return (
                <div
                  key={sub._id}
                  className="card fade-in"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                        }}
                      >
                        Submission — {new Date(sub.created_at).toLocaleString()}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {sub.images.length} image{sub.images.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {sub.appeal && (
                        <span className={`badge ${getOutcomeBadgeClass(sub.appeal.status)}`}>
                          Appeal: {sub.appeal.status}
                        </span>
                      )}
                      {canAppeal && !sub.appeal && (
                        <Link
                          to={`/appeal/${sub._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          File Appeal
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sub.images.map((img) => (
                      <VerdictCard key={img._id} image={img} verdict={img.verdict_id} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
