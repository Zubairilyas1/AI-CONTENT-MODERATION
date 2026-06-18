import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
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
        <h1 style={{ marginBottom: '4px' }}>Create your account</h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '24px',
          }}
        >
          Join the content moderation platform
        </p>

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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {/* Name Field */}
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
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="input"
            />
          </div>

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
              minLength={6}
              placeholder="At least 6 characters"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--accent)')}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
