import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/submit', label: 'Submit' },
    ...(isAdmin
      ? [
          { path: '/admin/appeals', label: 'Appeals' },
          { path: '/admin/policies', label: 'Policies' },
          { path: '/admin/analytics', label: 'Analytics' },
        ]
      : []),
  ];

  return (
    <nav
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '56px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 32px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <img
            src="/logo.png"
            alt="Zubair Logo"
            style={{
              height: '32px',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
          <span
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            ModerateAI
          </span>
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <div
            style={{
              display: 'none',
              gap: '32px',
              alignItems: 'center',
              '@media (min-width: 768px)': {
                display: 'flex',
              },
            }}
            className="desktop-nav"
          >
            <div style={{ display: 'flex', gap: '24px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: isActive(link.path) ? 'var(--text-primary)' : 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                    paddingBottom: '4px',
                    borderBottom: isActive(link.path) ? '2px solid var(--accent)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.path)) e.target.style.color = 'var(--text-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.path)) e.target.style.color = 'var(--text-muted)';
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Right Side */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* User Email */}
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                '@media (min-width: 768px)': {
                  display: 'flex',
                },
              }}
              className="user-info"
            >
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                {user.email}
              </span>
              {isAdmin && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--status-flagged-bg)',
                    color: 'var(--status-flagged)',
                  }}
                >
                  ADMIN
                </span>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              className="mobile-menu-btn"
            >
              <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)' }} />
              <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)' }} />
              <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)' }} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px 32px',
            background: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-default)',
          }}
          className="mobile-menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: isActive(link.path) ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .desktop-nav {
          display: none !important;
        }

        .mobile-menu-btn {
          display: flex !important;
        }

        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }

          .mobile-menu-btn {
            display: none !important;
          }

          .user-info {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
