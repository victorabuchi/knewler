'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Course {
  id: string;
  title: string;
}

export default function CreateExamPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [durationMins, setDurationMins] = useState(60);
  const [passScore, setPassScore] = useState(70);
  const [shuffle, setShuffle] = useState(true);
  const [tabLock, setTabLock] = useState(true);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/courses').then((res) => setCourses(res.data.courses)).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/exams', {
        title,
        course_id: courseId || null,
        duration_mins: durationMins,
        pass_score: passScore,
        shuffle,
        tab_lock: tabLock,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
      });
      router.push('/dashboard/exams');
    } catch (err: unknown) {
      const message = err instanceof Error
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? err.message
        : 'Failed to create exam. Please try again.'
      setError(message)
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    background: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    color: '#1a1a2e',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '0.4rem',
    color: '#374151',
  };

  const checkRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    cursor: 'pointer',
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
          Create Exam
        </h1>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '600px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Exam title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Midterm Physics Exam" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Course</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={inputStyle}>
              <option value="">— No course —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Duration (minutes)</label>
              <input
                type="number"
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
                min={5}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Pass score (%)</label>
              <input
                type="number"
                value={passScore}
                onChange={(e) => setPassScore(Number(e.target.value))}
                min={0}
                max={100}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Anti-cheat checkboxes */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>Anti-cheat settings</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <label style={checkRowStyle}>
                <input
                  type="checkbox"
                  checked={shuffle}
                  onChange={(e) => setShuffle(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0369A1' }}
                />
                <span style={{ fontSize: '0.9375rem', color: '#374151' }}>Shuffle questions</span>
              </label>
              <label style={checkRowStyle}>
                <input
                  type="checkbox"
                  checked={tabLock}
                  onChange={(e) => setTabLock(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0369A1' }}
                />
                <span style={{ fontSize: '0.9375rem', color: '#374151' }}>Tab lock (flag tab switches)</span>
              </label>
            </div>
          </div>

          {/* Optional scheduling */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <label style={labelStyle}>Start date &amp; time (optional)</label>
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End date &amp; time (optional)</label>
              <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '0.625rem 1.5rem', background: loading ? '#93C5FD' : '#0369A1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating…' : 'Create Exam'}
            </button>
            <Link
              href="/dashboard/exams"
              style={{ padding: '0.625rem 1.5rem', background: '#F1F5F9', color: '#475569', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
