'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Course {
  id: string;
  title: string;
}

export default function NewSessionPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/api/courses')
      .then((res) => setCourses(res.data.courses))
      .catch(() => {
        // non-fatal — course select just stays empty
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/schedule', {
        title,
        course_id: courseId || null,
        location: location || null,
        starts_at: startsAt,
        ends_at: endsAt,
        recurrence,
      });
      router.push('/dashboard/schedule');
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Failed to create session. Please try again.');
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

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: 0,
          }}
        >
          New Session
        </h1>
      </div>

      {/* Form card */}
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
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: '#DC2626',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Session title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Physics Lecture 01"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              style={inputStyle}
            >
              <option value="">— No course —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room 101 or Zoom link"
              style={inputStyle}
            />
          </div>

          {/* Start / End datetime row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <label style={labelStyle}>Start date &amp; time</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>End date &amp; time</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Recurrence</label>
            <select
              value={recurrence}
              onChange={(e) =>
                setRecurrence(e.target.value as 'none' | 'daily' | 'weekly')
              }
              style={inputStyle}
            >
              <option value="none">None (one-off)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.625rem 1.5rem',
                background: loading ? '#93C5FD' : '#0369A1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving…' : 'Create Session'}
            </button>
            <Link
              href="/dashboard/schedule"
              style={{
                padding: '0.625rem 1.5rem',
                background: '#F1F5F9',
                color: '#475569',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
