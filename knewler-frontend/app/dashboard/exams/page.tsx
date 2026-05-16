'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Exam {
  id: string;
  title: string;
  course_title: string | null;
  duration_mins: number;
  pass_score: number;
  shuffle: boolean;
  tab_lock: boolean;
  starts_at: string | null;
  ends_at: string | null;
  question_count: number;
}

function examStatus(exam: Exam): 'scheduled' | 'active' | 'ended' {
  const now = Date.now();
  const start = exam.starts_at ? new Date(exam.starts_at).getTime() : null;
  const end = exam.ends_at ? new Date(exam.ends_at).getTime() : null;
  if (end && now > end) return 'ended';
  if (start && now >= start) return 'active';
  return 'scheduled';
}

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  scheduled: { background: '#DBEAFE', color: '#1D4ED8' },
  active: { background: '#DCFCE7', color: '#166534' },
  ended: { background: '#F1F5F9', color: '#475569' },
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Scheduled',
  active: 'Active',
  ended: 'Ended',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Shuffle icon
function ShuffleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
    </svg>
  );
}

// Lock icon
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/exams')
      .then((res) => setExams(res.data.exams))
      .catch(() => setError('Failed to load exams.'))
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.25rem' }}>
            Exams
          </h1>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
            Create and manage assessments
          </p>
        </div>
        <Link
          href="/dashboard/exams/create"
          style={{
            padding: '0.625rem 1.25rem',
            background: '#0369A1',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Create Exam
        </Link>
      </div>

      {loading && <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>}

      {!loading && error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && exams.length === 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
            No exams yet. Create your first exam.
          </p>
        </div>
      )}

      {!loading && !error && exams.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {exams.map((exam) => {
            const status = examStatus(exam);
            return (
              <div
                key={exam.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Card header stripe */}
                <div style={{ height: '6px', background: STATUS_STYLE[status].background }} />

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Title + status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                      {exam.title}
                    </h2>
                    <span style={{ flexShrink: 0, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, ...STATUS_STYLE[status] }}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>

                  {/* Course */}
                  {exam.course_title && (
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: '#64748B' }}>
                      {exam.course_title}
                    </p>
                  )}

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#475569' }}>
                      {exam.duration_mins} min
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#475569' }}>
                      Pass: {exam.pass_score}%
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#475569' }}>
                      {exam.question_count} {exam.question_count === 1 ? 'question' : 'questions'}
                    </span>
                  </div>

                  {/* Dates */}
                  {(exam.starts_at || exam.ends_at) && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      {exam.starts_at && (
                        <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                          Starts: {formatDate(exam.starts_at)}
                        </p>
                      )}
                      {exam.ends_at && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                          Ends: {formatDate(exam.ends_at)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Anti-cheat indicators */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    {exam.tab_lock && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#64748B', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        <LockIcon /> Tab lock
                      </span>
                    )}
                    {exam.shuffle && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#64748B', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        <ShuffleIcon /> Shuffle
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <Link
                      href={`/dashboard/exams/${exam.id}`}
                      style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#F1F5F9', color: '#0369A1', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
