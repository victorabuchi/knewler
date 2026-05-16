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
  { label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

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

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      {/* Top: logo + institution */}
      <div
        style={{
          padding: '1.5rem 1.25rem 1rem',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: '#1a1a2e' }}>knew</span>
          <span style={{ color: '#0EA5E9' }}>ler</span>
        </div>

        {institutionName && (
          <p
            style={{
              margin: '0.4rem 0 0',
              fontSize: '0.75rem',
              color: '#64748B',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {institutionName}
          </p>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
        {NAV_LINKS.map(({ label, href }) => {
          const active = isActive(href);
          const hovered = hoveredHref === href;
          return (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => setHoveredHref(href)}
              onMouseLeave={() => setHoveredHref(null)}
              style={{
                display: 'block',
                padding: '0.625rem 1.25rem',
                fontSize: '0.9375rem',
                fontWeight: active ? 600 : 400,
                color: active ? '#0369A1' : '#374151',
                textDecoration: 'none',
                background: active ? '#EFF6FF' : hovered ? '#F1F5F9' : 'transparent',
                borderLeft: active ? '3px solid #0369A1' : '3px solid transparent',
                transition: 'background 0.1s',
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user info + sign out */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        {user && (
          <div style={{ marginBottom: '0.75rem' }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1a1a2e',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </p>
            <p
              style={{
                margin: '0.2rem 0 0',
                fontSize: '0.75rem',
                color: '#64748B',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </p>
          </div>
        )}

        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            color: '#374151',
            fontSize: '0.875rem',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
