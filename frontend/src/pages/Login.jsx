import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        backgroundImage: 'radial-gradient(circle, #1f1f1f 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-surface)',
          borderRadius: '10px',
          padding: '40px',
          border: '1px solid var(--border-default)',
          boxShadow: '0 0 0 1px var(--border-default), 0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
        className="fade-in"
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent)',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            ModerateAI
          </span>
        </div>

        {/* Heading */}
        <h1 style={{ marginBottom: '4px' }}>Welcome back</h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '24px',
          }}
        >
          Sign in to your account to continue
        </p>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              background: 'var(--status-blocked-bg)',
              border: `1px solid ${(() => {
                const color = '#dc2626';
                return color;
              })()}`,
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--status-blocked)',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {/* Email Field */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="input"
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '24px',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--accent)')}
          >
            Create one
          </Link>
        </div>

        {/* Demo Info */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <p style={{ fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
            Demo accounts:
          </p>
          <p>
            <strong>Admin:</strong> admin@platform.com / Admin123
          </p>
          <p>
            <strong>User:</strong> user@platform.com / User123
          </p>
        </div>
      </div>
    </div>
  );
}
