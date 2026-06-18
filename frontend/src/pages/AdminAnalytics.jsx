import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const VERDICT_COLORS = {
  Approved: 'var(--status-approved)',
  'Flagged for Review': 'var(--status-pending)',
  Blocked: 'var(--status-blocked)',
};

const PIE_COLORS = [
  'var(--status-approved)',
  'var(--status-pending)',
  'var(--status-blocked)',
  'var(--accent)',
  '#8b5cf6',
  '#ec4899',
];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then(({ data: analytics }) => setData(analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <Navbar />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '96px 16px',
          }}
        >
          <div className="spin" />
        </div>
      </div>
    );
  }

  const verdictPieData = Object.entries(data.verdictDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const StatCard = ({ label, value }) => (
    <div className="card" style={{ background: 'var(--bg-elevated)' }}>
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
          color: 'var(--accent)',
        }}
      >
        {value}
      </p>
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div className="card">
      <h2
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container fade-in">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Platform-wide moderation metrics</p>
        </div>

        {/* Top Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <StatCard label="Total Submissions" value={data.totals.submissions} />
          <StatCard label="Total Verdicts" value={data.totals.verdicts} />
          <StatCard label="Total Users" value={data.totals.users} />
        </div>

        {/* Charts Row 1: Line + Pie */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <ChartCard title="Submission Volume Over Time">
            {data.submissionVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.submissionVolume}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-default)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p
                style={{
                  textAlign: 'center',
                  padding: '48px 16px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                No submission data yet.
              </p>
            )}
          </ChartCard>

          <ChartCard title="Verdict Distribution">
            {verdictPieData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={verdictPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelStyle={{ fontSize: '11px', fill: 'var(--text-secondary)' }}
                  >
                    {verdictPieData.map((entry, idx) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.name === 'Approved'
                            ? 'var(--status-approved)'
                            : entry.name === 'Flagged for Review'
                              ? 'var(--status-pending)'
                              : entry.name === 'Blocked'
                                ? 'var(--status-blocked)'
                                : PIE_COLORS[idx % PIE_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p
                style={{
                  textAlign: 'center',
                  padding: '48px 16px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                No verdict data yet.
              </p>
            )}
          </ChartCard>
        </div>

        {/* Charts Row 2: Category Bar Chart */}
        <div style={{ marginBottom: '32px' }}>
          <ChartCard title="Detections by Category">
            {data.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={data.categoryDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-default)"
                  />
                  <XAxis type="number" allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={190}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p
                style={{
                  textAlign: 'center',
                  padding: '48px 16px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                No detections yet.
              </p>
            )}
          </ChartCard>
        </div>

        {/* Appeal Metrics + Tables Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Appeal Metrics Card */}
          <ChartCard title="Appeal Metrics">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              {[
                { label: 'Total Appeals', value: data.appealMetrics.total },
                { label: 'Pending', value: data.appealMetrics.pending },
                { label: 'Accepted', value: data.appealMetrics.accepted },
                { label: 'Rejected', value: data.appealMetrics.rejected },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px',
                    }}
                  >
                    {m.label}
                  </p>
                  <p
                    style={{
                      fontSize: '24px',
                      fontWeight: 600,
                      color: 'var(--accent)',
                    }}
                  >
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
            <div
              style={{
                paddingTop: '12px',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                }}
              >
                Resolution Rate:{' '}
                <span
                  style={{
                    fontWeight: 600,
                    color: 'var(--accent)',
                  }}
                >
                  {data.appealMetrics.resolutionRate}%
                </span>
              </p>
            </div>
          </ChartCard>

          {/* Top Submitters Table */}
          <ChartCard title="Top Submitters">
            {data.submissionLeaderboard.length > 0 ? (
              <table style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-default)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <th
                      style={{
                        textAlign: 'left',
                        paddingBottom: '8px',
                        fontWeight: 500,
                        fontSize: '12px',
                      }}
                    >
                      User
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        paddingBottom: '8px',
                        fontWeight: 500,
                        fontSize: '12px',
                      }}
                    >
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.submissionLeaderboard.map((u, idx) => (
                    <tr
                      key={u.userId}
                      style={{
                        borderBottom:
                          idx < data.submissionLeaderboard.length - 1
                            ? '1px solid var(--border-subtle)'
                            : 'none',
                      }}
                    >
                      <td style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {u.name}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          {u.email}
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          paddingTop: '10px',
                          paddingBottom: '10px',
                          fontWeight: 600,
                          color: 'var(--accent)',
                        }}
                      >
                        {u.submissionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p
                style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                No data yet.
              </p>
            )}
          </ChartCard>
        </div>

        {/* Top Violations Table */}
        <ChartCard title="Top Violations">
          {data.violationLeaderboard.length > 0 ? (
            <table style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-default)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <th
                    style={{
                      textAlign: 'left',
                      paddingBottom: '8px',
                      fontWeight: 500,
                      fontSize: '12px',
                    }}
                  >
                    User
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      paddingBottom: '8px',
                      fontWeight: 500,
                      fontSize: '12px',
                    }}
                  >
                    Violations
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.violationLeaderboard.map((u, idx) => (
                  <tr
                    key={u.userId}
                    style={{
                      borderBottom:
                        idx < data.violationLeaderboard.length - 1
                          ? '1px solid var(--border-subtle)'
                          : 'none',
                    }}
                  >
                    <td style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {u.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {u.email}
                      </div>
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        fontWeight: 600,
                        color: 'var(--status-blocked)',
                      }}
                    >
                      {u.violationCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              No violations yet.
            </p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
