'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Session {
  id: string;
  title: string;
  location: string | null;
  starts_at: string;
  ends_at: string;
  recurrence: string;
  course_title: string | null;
  teacher_name: string | null;
}

const RECURRENCE_LABELS: Record<string, string> = {
  none: 'Once',
  daily: 'Daily',
  weekly: 'Weekly',
};

function formatDateRange(starts: string, ends: string): string {
  const s = new Date(starts);
  const e = new Date(ends);

  const date = s.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const startTime = s.toLocaleTimeString('en-GB', timeOpts);
  const endTime = e.toLocaleTimeString('en-GB', timeOpts);

  return `${date} · ${startTime} – ${endTime}`;
}

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/schedule')
      .then((res) => setSessions(res.data.sessions))
      .catch(() => setError('Failed to load schedule.'))
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
            Schedule
          </h1>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
            Manage timetables and room bookings
          </p>
        </div>
        <Link
          href="/dashboard/schedule/new"
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
          New Session
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
      {!loading && !error && sessions.length === 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
            No sessions scheduled yet. Create your first session.
          </p>
        </div>
      )}

      {/* Session list */}
      {!loading && !error && sessions.length > 0 && (
        <div>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              {/* Colored left border accent */}
              <div
                style={{
                  width: '4px',
                  flexShrink: 0,
                  background: '#0369A1',
                }}
              />

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p
                    style={{
                      margin: '0 0 0.25rem',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      color: '#1a1a2e',
                    }}
                  >
                    {session.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8125rem',
                      color: '#64748B',
                    }}
                  >
                    {[session.course_title, session.teacher_name]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                {/* Location */}
                {session.location && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: '#475569',
                      minWidth: '120px',
                    }}
                  >
                    {session.location}
                  </p>
                )}

                {/* Date + time range */}
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#475569',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDateRange(session.starts_at, session.ends_at)}
                </p>

                {/* Recurrence badge */}
                <span
                  style={{
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: '#F1F5F9',
                    color: '#475569',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {RECURRENCE_LABELS[session.recurrence] ?? session.recurrence}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
