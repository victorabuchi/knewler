'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface ExamItem {
  id: string;
  title: string;
  course_title: string;
  duration_mins: number;
  pass_score: number;
  tab_lock: boolean;
  starts_at: string | null;
  ends_at: string | null;
  attempt_id: string | null;
  submitted_at: string | null;
  score: number | null;
  passed: boolean | null;
}

function examStatus(e: ExamItem): 'not_started' | 'available' | 'in_progress' | 'missed' | 'submitted' {
  if (e.submitted_at) return 'submitted';
  const now = Date.now();
  if (e.starts_at && new Date(e.starts_at).getTime() > now) return 'not_started';
  if (e.ends_at && new Date(e.ends_at).getTime() < now) return 'missed';
  if (e.attempt_id) return 'in_progress';
  return 'available';
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  not_started: { bg: '#F1F5F9', color: '#475569', label: 'Not Started' },
  available:   { bg: '#DCFCE7', color: '#166534', label: 'Available' },
  in_progress: { bg: '#FEF3C7', color: '#92400E', label: 'In Progress' },
  missed:      { bg: '#FEE2E2', color: '#991B1B', label: 'Missed' },
  submitted:   { bg: '#EFF6FF', color: '#1D4ED8', label: 'Submitted' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ExamCard({ exam }: { exam: ExamItem }) {
  const status = examStatus(exam);
  const statusStyle = STATUS_STYLE[status];
  const canStart = status === 'available' || status === 'in_progress';

  return (
    <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600, color: '#1a1a2e' }}>{exam.title}</h3>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B' }}>{exam.course_title}</p>
        </div>
        <span
          style={{
            flexShrink: 0,
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: statusStyle.bg,
            color: statusStyle.color,
          }}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#64748B' }}>
        <span>{exam.duration_mins} min</span>
        <span>Pass: {exam.pass_score}%</span>
        {exam.starts_at && <span>Opens: {formatDate(exam.starts_at)}</span>}
        {exam.ends_at && <span>Closes: {formatDate(exam.ends_at)}</span>}
        {exam.tab_lock && <span style={{ color: '#DC2626' }}>Anti-cheat on</span>}
      </div>

      {/* Past result row */}
      {status === 'submitted' && exam.score !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: exam.passed ? '#059669' : '#DC2626' }}>
            {exam.score}%
          </span>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: exam.passed ? '#DCFCE7' : '#FEE2E2',
              color: exam.passed ? '#166534' : '#991B1B',
            }}
          >
            {exam.passed ? 'Passed' : 'Failed'}
          </span>
        </div>
      )}

      {/* Action */}
      {canStart && (
        <Link
          href={`/learn/exams/${exam.id}`}
          style={{
            display: 'inline-block',
            padding: '0.5rem 1.25rem',
            background: '#0369A1',
            color: '#ffffff',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {status === 'in_progress' ? 'Resume Exam' : 'Start Exam'}
        </Link>
      )}
      {status === 'submitted' && (
        <Link
          href={`/learn/exams/${exam.id}`}
          style={{
            display: 'inline-block',
            padding: '0.5rem 1.25rem',
            background: '#F1F5F9',
            color: '#0369A1',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          View Results
        </Link>
      )}
      {status === 'not_started' && exam.starts_at && (
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94A3B8' }}>
          Available from {formatDate(exam.starts_at)}
        </p>
      )}
      {status === 'missed' && (
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#DC2626' }}>
          Submission window closed
        </p>
      )}
    </div>
  );
}

export default function LearnExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/learn/exams')
      .then((r) => setExams(r.data.exams))
      .catch(() => setError('Failed to load exams.'))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = exams.filter((e) => examStatus(e) !== 'submitted');
  const past = exams.filter((e) => examStatus(e) === 'submitted');

  const emptyCard = (msg: string) => (
    <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9375rem' }}>
      {msg}
    </div>
  );

  const sectionHeading: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    margin: '0 0 0.875rem',
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.25rem' }}>Exams</h1>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>Your upcoming and completed exams</p>
      </div>

      {loading && <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>}

      {!loading && error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={sectionHeading}>Upcoming</p>
            {upcoming.length === 0
              ? emptyCard('No upcoming exams.')
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{upcoming.map(e => <ExamCard key={e.id} exam={e} />)}</div>
            }
          </div>

          <div>
            <p style={sectionHeading}>Past Exams</p>
            {past.length === 0
              ? emptyCard('No completed exams yet.')
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{past.map(e => <ExamCard key={e.id} exam={e} />)}</div>
            }
          </div>
        </>
      )}
    </div>
  );
}
