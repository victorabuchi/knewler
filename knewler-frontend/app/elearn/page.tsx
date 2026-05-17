'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface EnrolledCourse {
  id: string;
  title: string;
  teacher_name: string;
  progress: number;
}

interface ScheduleSession {
  id: string;
  title: string;
  course_title: string;
  teacher_name: string;
  starts_at: string;
  location: string;
}

interface UpcomingExam {
  id: string;
  title: string;
  course_title: string;
  starts_at: string | null;
  duration_mins: number;
}

const COVER_COLORS = ['#0369A1', '#0891B2', '#059669', '#7C3AED', '#DB2777', '#D97706'];

function coverColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COVER_COLORS[hash % COVER_COLORS.length];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LearnPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [exams, setExams] = useState<UpcomingExam[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);

  const userObj = user as (typeof user & { first_name?: string }) | null;
  const firstName = userObj?.first_name ?? user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    api.get('/api/elearn/courses').then((r) => setCourses(r.data.courses)).catch(() => {}).finally(() => setLoadingCourses(false));
    api.get('/api/elearn/schedule').then((r) => setSessions(r.data.sessions)).catch(() => {}).finally(() => setLoadingSessions(false));
    api.get('/api/elearn/exams').then((r) => setExams(r.data.exams)).catch(() => {}).finally(() => setLoadingExams(false));
  }, []);

  const sectionHeading: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    margin: '0 0 0.875rem',
  };

  const emptyCard: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '0.9375rem',
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.25rem' }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* My Courses */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <p style={{ ...sectionHeading, margin: 0 }}>My Courses</p>
          <Link href="/elearn/courses" style={{ fontSize: '0.8125rem', color: '#0369A1', textDecoration: 'none', fontWeight: 500 }}>
            View all
          </Link>
        </div>

        {loadingCourses ? (
          <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>Loading…</p>
        ) : courses.length === 0 ? (
          <div style={emptyCard}>You haven&apos;t been enrolled in any courses yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {courses.slice(0, 3).map((c) => (
              <div key={c.id} style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ height: '6px', background: coverColor(c.id) }} />
                <div style={{ padding: '1rem' }}>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#1a1a2e', fontSize: '0.9375rem' }}>{c.title}</p>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: '#64748B' }}>
                    {c.teacher_name || 'No teacher assigned'}
                  </p>
                  <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.375rem' }}>
                    <div style={{ height: '100%', width: `${c.progress}%`, background: '#0369A1', borderRadius: '999px' }} />
                  </div>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: '#94A3B8' }}>{c.progress}% complete</p>
                  <Link
                    href={`/elearn/courses/${c.id}`}
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0369A1', textDecoration: 'none' }}
                  >
                    Continue →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Schedule */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={sectionHeading}>Upcoming Schedule</p>
        {loadingSessions ? (
          <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>Loading…</p>
        ) : sessions.length === 0 ? (
          <div style={emptyCard}>No upcoming sessions in the next 7 days.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.125rem', fontWeight: 600, color: '#1a1a2e', fontSize: '0.9375rem' }}>{s.title}</p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B' }}>
                    {formatDate(s.starts_at)}{s.location ? ` · ${s.location}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Exams */}
      <div>
        <p style={sectionHeading}>Upcoming Exams</p>
        {loadingExams ? (
          <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>Loading…</p>
        ) : exams.length === 0 ? (
          <div style={emptyCard}>No upcoming exams.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {exams.map((exam) => (
              <div
                key={exam.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.125rem', fontWeight: 600, color: '#1a1a2e', fontSize: '0.9375rem' }}>{exam.title}</p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B' }}>
                    {exam.course_title ? `${exam.course_title} · ` : ''}{exam.duration_mins} min
                    {exam.starts_at ? ` · ${formatDate(exam.starts_at)}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
