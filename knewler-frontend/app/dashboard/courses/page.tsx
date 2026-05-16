'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Course {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  teacher_name: string;
  student_count: number;
  created_at: string;
}

const COVER_COLORS = [
  '#0369A1',
  '#0891B2',
  '#059669',
  '#7C3AED',
  '#DB2777',
  '#D97706',
  '#DC2626',
];

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  draft: { background: '#F1F5F9', color: '#475569' },
  published: { background: '#DCFCE7', color: '#166534' },
  archived: { background: '#FEE2E2', color: '#991B1B' },
};

function coverColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COVER_COLORS[hash % COVER_COLORS.length];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/courses')
      .then((res) => setCourses(res.data.courses))
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: '0 0 0.25rem',
            }}
          >
            Courses
          </h1>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
            Manage your institution&apos;s courses
          </p>
        </div>
        <Link
          href="/dashboard/courses/create"
          style={{
            display: 'inline-block',
            padding: '0.625rem 1.25rem',
            background: '#0369A1',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Create Course
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#DC2626',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && courses.length === 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              background: '#F1F5F9',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <p
            style={{
              margin: '0 0 1.25rem',
              fontSize: '0.9375rem',
              color: '#64748B',
            }}
          >
            No courses yet. Create your first course to get started.
          </p>
          <Link
            href="/dashboard/courses/create"
            style={{
              display: 'inline-block',
              padding: '0.625rem 1.25rem',
              background: '#0369A1',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create Course
          </Link>
        </div>
      )}

      {/* Course cards grid */}
      {!loading && !error && courses.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
          }}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {/* Cover color block */}
              <div
                style={{
                  height: '100px',
                  background: coverColor(course.id),
                }}
              />

              {/* Card body */}
              <div style={{ padding: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#1a1a2e',
                      lineHeight: 1.3,
                    }}
                  >
                    {course.title}
                  </h2>
                  <span
                    style={{
                      flexShrink: 0,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      ...STATUS_STYLES[course.status],
                    }}
                  >
                    {course.status}
                  </span>
                </div>

                <p
                  style={{
                    margin: '0 0 0.75rem',
                    fontSize: '0.8125rem',
                    color: '#64748B',
                  }}
                >
                  {course.teacher_name || 'No teacher assigned'}
                </p>

                <p
                  style={{
                    margin: '0 0 1rem',
                    fontSize: '0.8125rem',
                    color: '#94A3B8',
                  }}
                >
                  {course.student_count}{' '}
                  {course.student_count === 1 ? 'student' : 'students'}
                </p>

                <Link
                  href={`/dashboard/courses/${course.id}`}
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: '#F1F5F9',
                    color: '#0369A1',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
