import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import VerdictCard from '../components/VerdictCard';
import api from '../api/axios';

const statusFilter = ['', 'Pending', 'Accepted', 'Rejected'];

export default function AdminAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [stats, setStats] = useState({ Pending: 0, Accepted: 0, Rejected: 0 });
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);
  const [responses, setResponses] = useState({});

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await api.get('/admin/appeals', { params });
      setAppeals(data);

      // Fetch all appeals to calculate stats
      const { data: allAppeals } = await api.get('/admin/appeals');
      const statsByStatus = { Pending: 0, Accepted: 0, Rejected: 0 };
      allAppeals.forEach((appeal) => {
        if (statsByStatus.hasOwnProperty(appeal.status)) {
          statsByStatus[appeal.status]++;
        }
      });
      setStats(statsByStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, [filter]);

  const handleResolve = async (id, status) => {
    setResolving(id);
    try {
      await api.patch(`/admin/appeals/${id}`, {
        status,
        admin_response: responses[id] || '',
      });
      fetchAppeals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve appeal.');
    } finally {
      setResolving(null);
    }
  };

  const StatCard = ({ label, value, accentColor }) => (
    <div
      className="card"
      style={{
        background: 'var(--bg-elevated)',
      }}
    >
      <p
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '32px',
          fontWeight: 600,
          color: accentColor,
        }}
      >
        {value}
      </p>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container fade-in">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">Appeals Queue</h1>
          <p className="page-subtitle">Review and resolve user appeals</p>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <StatCard
            label="Pending"
            value={stats.Pending}
            accentColor="var(--status-pending)"
          />
          <StatCard
            label="Accepted"
            value={stats.Accepted}
            accentColor="var(--status-approved)"
          />
          <StatCard
            label="Rejected"
            value={stats.Rejected}
            accentColor="var(--status-blocked)"
          />
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          {statusFilter.map((status) => (
            <button
              key={status || 'all'}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                borderRadius: '6px',
                background:
                  filter === status
                    ? 'var(--accent)'
                    : 'var(--bg-elevated)',
                color:
                  filter === status
                    ? 'var(--bg-base)'
                    : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        {/* Appeals List */}
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '48px 16px',
            }}
          >
            <div className="spin" />
          </div>
        ) : appeals.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '48px 16px',
              background: 'var(--bg-elevated)',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              No appeals in this queue.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appeals.map((appeal) => (
              <div key={appeal._id} className="card">
                {/* Appeal Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border-default)',
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
                      {appeal.user_id?.name || 'Unknown User'}
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {appeal.user_id?.email || 'No email'}
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                      }}
                    >
                      Filed {new Date(appeal.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`badge ${
                      appeal.status === 'Pending'
                        ? 'badge-pending'
                        : appeal.status === 'Accepted'
                          ? 'badge-approved'
                          : 'badge-blocked'
                    }`}
                  >
                    {appeal.status}
                  </span>
                </div>

                {/* User Justification */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '6px',
                    }}
                  >
                    User Justification
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {appeal.justification}
                  </p>
                </div>

                {/* Submission Verdicts */}
                {appeal.submission_id?.images?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
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
                      Flagged Content
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {appeal.submission_id.images.map((img) => (
                        <VerdictCard
                          key={img._id}
                          image={img}
                          verdict={img.verdict_id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Response Section (if Pending) */}
                {appeal.status === 'Pending' && (
                  <div
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '8px',
                      }}
                    >
                      Admin Response (Optional)
                    </label>
                    <textarea
                      placeholder="Provide feedback on the appeal decision..."
                      value={responses[appeal._id] || ''}
                      onChange={(e) =>
                        setResponses({
                          ...responses,
                          [appeal._id]: e.target.value,
                        })
                      }
                      minLength={0}
                      maxLength={500}
                      className="input"
                      style={{ minHeight: '100px', marginBottom: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleResolve(appeal._id, 'Accepted')}
                        disabled={resolving === appeal._id}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        {resolving === appeal._id ? 'Processing...' : 'Accept Appeal'}
                      </button>
                      <button
                        onClick={() => handleResolve(appeal._id, 'Rejected')}
                        disabled={resolving === appeal._id}
                        className="btn btn-danger"
                        style={{ flex: 1 }}
                      >
                        {resolving === appeal._id ? 'Processing...' : 'Reject Appeal'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Response Display (if already resolved) */}
                {appeal.admin_response && (
                  <div
                    style={{
                      background: 'var(--status-pending-bg)',
                      border: `1px solid var(--status-pending)`,
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--status-pending)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '6px',
                      }}
                    >
                      Admin Response
                    </p>
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--status-pending)',
                        lineHeight: 1.5,
                      }}
                    >
                      {appeal.admin_response}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
