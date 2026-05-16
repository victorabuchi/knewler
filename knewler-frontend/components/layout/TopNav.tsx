'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Courses', href: '/dashboard/courses' },
  { label: 'Students', href: '/dashboard/students' },
  { label: 'Schedule', href: '/dashboard/schedule' },
  { label: 'Exams', href: '/dashboard/exams' },
  { label: 'Certificates', href: '/dashboard/certificates' },
];

const ROLE_BADGE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  admin:   { bg: '#EFF6FF', color: '#0369A1', border: '#BFDBFE', label: 'Admin' },
  teacher: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', label: 'Teacher' },
  student: { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', label: 'Student' },
};

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [institutionName, setInstitutionName] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('knewler_tenant');
    if (raw) {
      try {
        const tenant = JSON.parse(raw);
        setInstitutionName(tenant.name ?? tenant.institution_name ?? null);
      } catch {
        // corrupted storage
      }
    }
  }, []);

  function handleSignOut() {
    logout();
    localStorage.removeItem('knewler_tenant');
    router.push('/login');
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  const userWithRole = user as (typeof user & { role?: string; first_name?: string }) | null;
  const firstName = userWithRole?.first_name ?? user?.name?.split(' ')[0] ?? '';
  const role = userWithRole?.role ?? 'student';
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.student;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '60px',
        background: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'stretch',
        paddingLeft: '32px',
        paddingRight: '32px',
      }}
    >
      {/* Left: wordmark + institution */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginRight: '40px',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
          <span style={{ color: '#1a1a2e' }}>knew</span>
          <span style={{ color: '#0EA5E9' }}>ler</span>
        </div>
        {institutionName && (
          <span
            style={{
              fontSize: '11px',
              color: '#64748B',
              marginTop: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '180px',
            }}
          >
            {institutionName}
          </span>
        )}
      </div>

      {/* Center: nav links */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: '32px',
        }}
      >
        {NAV_LINKS.map(({ label, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                fontWeight: 500,
                color: active ? '#0369A1' : '#374151',
                textDecoration: 'none',
                borderBottom: active ? '2px solid #0369A1' : '2px solid transparent',
                paddingBottom: '1px',
                whiteSpace: 'nowrap',
                transition: 'color 0.1s',
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right: user name + role badge + sign out */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          marginLeft: '40px',
        }}
      >
        {firstName && (
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>
            {firstName}
          </span>
        )}

        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '999px',
            background: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            textTransform: 'capitalize',
          }}
        >
          {badge.label}
        </span>

        <button
          onClick={handleSignOut}
          style={{
            padding: '5px 12px',
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            color: '#374151',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
