import React, { useState } from 'react';
import axios from 'axios';
import { Copy, Check, ExternalLink, Link2, BarChart2, Monitor, Compass } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const API_BASE = 'http://localhost:5000';
const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24'];

export default function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const [searchSlug, setSearchSlug] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setCreatedUrl(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/shorten`, {
        originalUrl,
        customSlug: customSlug.trim() || undefined,
      });

      setCreatedUrl(response.data);
      setSearchSlug(response.data.slug);
      fetchAnalytics(response.data.slug);
      setOriginalUrl('');
      setCustomSlug('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (slugToQuery) => {
    const slug = slugToQuery || searchSlug;
    if (!slug) return;

    setAnalyticsLoading(true);
    setAnalyticsError('');

    try {
      const res = await axios.get(`${API_BASE}/api/analytics/${slug.trim()}`);
      setAnalyticsData(res.data);
    } catch (err) {
      setAnalyticsData(null);
      setAnalyticsError(err.response?.data?.error || 'Analytics not found for this slug');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#38bdf8' }}>
          Smart URL Shortener
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '8px' }}>
          Production short links with telemetry analytics
        </p>
      </header>

      {/* URL Creation Form */}
      <section style={{ background: '#1e293b', padding: '24px', borderRadius: '12px' }}>
        <form onSubmit={handleShorten} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', color: '#cbd5e1' }}>
              Destination URL (Enter your long link here)
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/very-long-link"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', color: '#cbd5e1' }}>
              Custom Alias (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. portfolio, launch-deal"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
          </div>

          {error && <div style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Link2 size={18} />
            {loading ? 'Creating...' : 'Shorten Link'}
          </button>
        </form>

        {createdUrl && (
          <div style={{ marginTop: '20px', padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #38bdf8' }}>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '8px' }}>Your shortened link:</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <a href={createdUrl.shortUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {createdUrl.shortUrl} <ExternalLink size={14} />
              </a>
              <button onClick={handleCopy} style={{ background: copied ? '#16a34a' : '#334155', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Analytics Search Bar */}
      <section style={{ background: '#1e293b', padding: '24px', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={20} color="#38bdf8" /> Inspect Link Analytics
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Enter slug (e.g. Nt423P)"
            value={searchSlug}
            onChange={(e) => setSearchSlug(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
          />
          <button
            onClick={() => fetchAnalytics()}
            disabled={analyticsLoading}
            style={{ padding: '0 20px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#0f172a', fontWeight: '600' }}
          >
            {analyticsLoading ? 'Loading...' : 'Lookup'}
          </button>
        </div>

        {analyticsError && <p style={{ color: '#f87171', marginTop: '12px', fontSize: '0.875rem' }}>{analyticsError}</p>}
      </section>

      {/* Charts & KPI Cards */}
      {analyticsData && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #38bdf8' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Clicks</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '4px' }}>{analyticsData.totalClicks}</h3>
            </div>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #34d399' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Unique Visitors</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '4px' }}>{analyticsData.uniqueVisitors}</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Monitor size={16} color="#38bdf8" /> Devices Breakdown
              </h4>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={analyticsData.devices}>
                    <XAxis dataKey="device" stroke="#94a3b8" />
                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px' }} />
                    <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Compass size={16} color="#818cf8" /> Browser Share
              </h4>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={analyticsData.browsers} dataKey="count" nameKey="browser" cx="50%" cy="50%" outerRadius={70} label>
                      {analyticsData.browsers.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}