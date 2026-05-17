'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  teacher_name: string;
  progress: number;
  last_accessed_at: string | null;
}

const COVER_COLORS = ['#0369A1', '#0891B2', '#059669', '#7C3AED', '#DB2777', '#D97706', '#DC2626'];

function coverColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COVER_COLORS[hash % COVER_COLORS.length];
}

function timeAgo(iso: string | null) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LearnCoursesPage() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/elearn/courses')
      .then((r) => setCourses(r.data.courses))
      .catch(() => setError('Failed to load your courses.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.25rem' }}>My Courses</h1>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
          Courses you&apos;re currently enrolled in
        </p>
      </div>

      {loading && <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>}

      {!loading && error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
            You haven&apos;t been enrolled in any courses yet. Contact your administrator.
          </p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}
            >
              {/* Cover */}
              <div style={{ height: '100px', background: coverColor(course.id) }} />

              {/* Body */}
              <div style={{ padding: '1.25rem' }}>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                  {course.title}
                </h2>
                <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: '#64748B' }}>
                  {course.teacher_name || 'No teacher assigned'}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Progress</span>
                    <span style={{ fontSize: '0.75rem', color: '#0369A1', fontWeight: 600 }}>{course.progress}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${course.progress}%`,
                        background: course.progress === 100 ? '#059669' : '#0369A1',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                <p style={{ margin: '0 0 1rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                  Last accessed: {timeAgo(course.last_accessed_at)}
                </p>

                <Link
                  href={`/elearn/courses/${course.id}`}
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: '#0369A1',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {course.progress === 100 ? 'Review' : 'Continue'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
