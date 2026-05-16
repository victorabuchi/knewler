'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useWindowWidth } from '@/lib/useWindowWidth';

interface Tenant {
  name?: string;
  institution_name?: string;
  type?: string;
}

const TYPE_LABELS: Record<string, string> = {
  university: 'University',
  corporate: 'Corporate',
  sports_club: 'Sports Club',
  school: 'School',
  other: 'Organization',
};

const STAT_CARDS = [
  { label: 'Total Courses' },
  { label: 'Total Students' },
  { label: 'Upcoming Exams' },
  { label: 'Certificates Issued' },
];

const QUICK_ACTIONS = [
  { label: 'Create Course', href: '/dashboard/courses/create' },
  { label: 'Add Student', href: '/dashboard/students/new' },
  { label: 'Schedule Class', href: '/dashboard/schedule/new' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('knewler_tenant');
    if (raw) {
      try {
        setTenant(JSON.parse(raw));
      } catch {
        // corrupted storage
      }
    }
  }, []);

  const institutionName = tenant?.name ?? tenant?.institution_name ?? '';
  const institutionType = tenant?.type ? (TYPE_LABELS[tenant.type] ?? tenant.type) : '';

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    margin: '0 0 0.875rem',
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: '0 0 0.25rem',
          }}
        >
          Dashboard
        </h1>
        {(institutionName || institutionType) && (
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
            {institutionName}
            {institutionName && institutionType && ' · '}
            {institutionType}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={sectionHeadingStyle}>Overview</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '1rem',
          }}
        >
          {STAT_CARDS.map(({ label }) => (
            <div
              key={label}
              style={{
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '24px',
              }}
            >
              <p
                style={{
                  margin: '0 0 0.5rem',
                  fontSize: '0.75rem',
                  color: '#64748B',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {label}
              </p>
              <span
                style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  fontWeight: 700,
                  color: '#0369A1',
                  lineHeight: 1,
                }}
              >
                0
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={sectionHeadingStyle}>Quick actions</p>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '0.75rem',
          }}
        >
          {QUICK_ACTIONS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '0.625rem 1.25rem',
                background: '#0369A1',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <p style={sectionHeadingStyle}>Recent activity</p>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
            No activity yet. Start by creating your first course.
          </p>
        </div>
      </div>
    </div>
  );
}
