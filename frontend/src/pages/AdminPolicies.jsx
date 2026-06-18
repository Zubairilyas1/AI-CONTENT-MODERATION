import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState('');

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/policies');
      setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const updatePolicy = async (category, updates) => {
    setSaving(category);
    setMessage('');
    try {
      const encoded = encodeURIComponent(category);
      const { data } = await api.patch(`/admin/policies/${encoded}`, updates);
      setPolicies((prev) => prev.map((p) => (p.category === category ? data : p)));
      setMessage(`Updated: ${category}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container fade-in" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">Policy Configuration</h1>
          <p className="page-subtitle">Manage moderation policies by category</p>
        </div>

        {/* Info Banner */}
        <div
          style={{
            background: 'var(--status-pending-bg)',
            border: `1px solid var(--status-pending)`,
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '24px',
            fontSize: '12px',
            color: 'var(--status-pending)',
            lineHeight: 1.5,
          }}
        >
          💡 Policy changes apply only to future submissions. Existing verdicts remain unchanged.
        </div>

        {/* Success Message */}
        {message && (
          <div
            style={{
              background: 'var(--status-approved-bg)',
              border: `1px solid var(--status-approved)`,
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: 'var(--status-approved)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            ✓ {message}
          </div>
        )}

        {/* Loading State */}
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {policies.map((policy) => (
              <div key={policy.category} className="card">
                {/* Policy Header with Toggle */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border-default)',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {policy.category}
                  </h3>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={policy.is_enabled}
                      onChange={(e) =>
                        updatePolicy(policy.category, {
                          is_enabled: e.target.checked,
                        })
                      }
                      disabled={saving === policy.category}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: 'var(--accent)',
                      }}
                    />
                    {policy.is_enabled ? 'Enabled' : 'Disabled'}
                  </label>
                </div>

                {/* Policy Settings Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {/* Confidence Threshold */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '10px',
                      }}
                    >
                      Confidence Threshold
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={policy.confidence_threshold}
                        onChange={(e) =>
                          setPolicies((prev) =>
                            prev.map((p) =>
                              p.category === policy.category
                                ? {
                                    ...p,
                                    confidence_threshold: Number(e.target.value),
                                  }
                                : p
                            )
                          )
                        }
                        onMouseUp={(e) =>
                          updatePolicy(policy.category, {
                            confidence_threshold: Number(e.target.value),
                          })
                        }
                        onTouchEnd={(e) =>
                          updatePolicy(policy.category, {
                            confidence_threshold: Number(e.target.value),
                          })
                        }
                        style={{
                          flex: 1,
                          height: '4px',
                          borderRadius: '2px',
                          background: 'var(--border-default)',
                          accentColor: 'var(--accent)',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--accent)',
                          minWidth: '40px',
                          textAlign: 'right',
                        }}
                      >
                        {policy.confidence_threshold}%
                      </span>
                    </div>
                  </div>

                  {/* Enforcement Behavior */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '10px',
                      }}
                    >
                      Enforcement Behavior
                    </label>
                    <select
                      value={policy.enforcement_behavior}
                      onChange={(e) =>
                        updatePolicy(policy.category, {
                          enforcement_behavior: e.target.value,
                        })
                      }
                      disabled={saving === policy.category}
                      className="input"
                      style={{ width: '100%' }}
                    >
                      <option value="Flag for Review">🚩 Flag for Review</option>
                      <option value="Auto-Block">🚫 Auto-Block</option>
                    </select>
                  </div>
                </div>

                {/* Last Updated */}
                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-default)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Last updated {new Date(policy.updated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
