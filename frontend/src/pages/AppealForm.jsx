import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VerdictCard from '../components/VerdictCard';
import api from '../api/axios';

export default function AppealForm() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/submissions/${submissionId}`).then(({ data }) => setSubmission(data));
  }, [submissionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError('Please provide a justification.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/appeals', { submission_id: submissionId, justification });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit appeal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container fade-in" style={{ maxWidth: '600px' }}>
        {/* Back Link */}
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--accent)',
            textDecoration: 'none',
            marginBottom: '32px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          ← Back to submissions
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">File an Appeal</h1>
          <p className="page-subtitle">Explain why you believe this verdict is incorrect</p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              background: 'var(--status-blocked-bg)',
              border: '1px solid var(--status-blocked)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--status-blocked)',
            }}
          >
            {error}
          </div>
        )}

        {/* Submission Summary */}
        {submission && (
          <div
            className="card"
            style={{
              marginBottom: '24px',
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
                marginBottom: '12px',
              }}
            >
              Submission Summary
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {submission.images.map((img) => (
                <VerdictCard key={img._id} image={img} verdict={img.verdict_id} />
              ))}
            </div>
          </div>
        )}

        {/* Appeal Form */}
        <form onSubmit={handleSubmit} className="card">
          {/* Justification */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}
            >
              Your Justification
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              minLength={10}
              required
              placeholder="Explain why you believe this content does not violate platform policies..."
              className="input"
              style={{ minHeight: '140px', resize: 'vertical' }}
            />
          </div>

          {/* Disclaimer */}
          <div
            style={{
              padding: '12px',
              background: 'var(--status-pending-bg)',
              border: `1px solid var(--status-pending)`,
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--status-pending)',
              marginBottom: '24px',
              lineHeight: 1.5,
            }}
          >
            Appeals are reviewed by administrators within 48 hours. Please be detailed and respectful in your justification.
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Appeal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
