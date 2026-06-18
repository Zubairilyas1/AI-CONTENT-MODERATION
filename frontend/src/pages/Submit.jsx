import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Submit() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [policies, setPolicies] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const { data } = await api.get('/policies');
        setPolicies(data);
      } catch (err) {
        console.error('Failed to fetch policies:', err);
      }
    };
    fetchPolicies();
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const selected = Array.from(e.dataTransfer.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one image.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container fade-in">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">Submit Images</h1>
          <p className="page-subtitle">Upload images for AI-powered moderation screening</p>
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

        {/* Two Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '32px',
          }}
          className="grid-responsive"
        >
          {/* Left - Upload Zone */}
          <form onSubmit={handleSubmit}>
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border-strong)'}`,
                borderRadius: '10px',
                padding: '48px',
                textAlign: 'center',
                background: dragActive ? 'var(--accent-subtle)' : 'transparent',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                marginBottom: '24px',
              }}
            >
              <input
                type="file"
                id="file-input"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                <div
                  style={{
                    fontSize: '24px',
                    marginBottom: '12px',
                  }}
                >
                  ↓
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  Drag and drop images here
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  or click to browse — PNG, JPG, WEBP up to 10MB
                </p>
              </label>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                {previews.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-default)',
                      aspectRatio: '1',
                    }}
                  >
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        background: 'var(--status-blocked)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || files.length === 0}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Analyzing images...' : `Run Moderation (${files.length} image${files.length !== 1 ? 's' : ''})`}
            </button>
          </form>

          {/* Right - Active Policies */}
          <div className="card">
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}
            >
              Active Policies
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {policies.map((policy) => (
                <div
                  key={policy._id}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border-default)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: policy.is_enabled ? 'var(--text-primary)' : 'var(--text-muted)',
                        opacity: policy.is_enabled ? 1 : 0.5,
                      }}
                    >
                      {policy.category}
                    </span>
                    <span
                      className={`badge ${policy.is_enabled ? 'badge-approved' : 'badge-pending'}`}
                    >
                      {policy.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      opacity: policy.is_enabled ? 1 : 0.5,
                    }}
                  >
                    <span>Threshold: {policy.confidence_threshold}%</span>
                    <span>{policy.enforcement_behavior}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
