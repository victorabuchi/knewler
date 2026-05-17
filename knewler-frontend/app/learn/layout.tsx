'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, getUserRole } from '@/lib/auth';
import { useWindowWidth } from '@/lib/useWindowWidth';

const NAV_LINKS = [
  { label: 'My Courses', href: '/learn/courses' },
  { label: 'Schedule', href: '/learn/schedule' },
  { label: 'Exams', href: '/learn/exams' },
  { label: 'Certificates', href: '/learn/certificates' },
  { label: 'Profile', href: '/learn/profile' },
];

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (!isLoading && user) {
      const role = getUserRole();
      if (role === 'admin' || role === 'teacher') {
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, router]);

  function handleSignOut() {
    logout();
    localStorage.removeItem('knewler_tenant');
    router.push('/login');
  }

  function isActive(href: string) {
    if (href === '/learn') return pathname === '/learn';
    return pathname.startsWith(href);
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#0369A1', fontSize: '1rem', fontWeight: 500 }}>Loading…</span>
      </div>
    );
  }

  if (!user) return null;

  const role = getUserRole();
  if (role === 'admin' || role === 'teacher') return null;

  // Course viewer has its own full-screen layout — skip the nav shell
  if (pathname.startsWith('/learn/courses/')) {
    return <>{children}</>;
  }

  const userObj = user as (typeof user & { first_name?: string });
  const firstName = userObj?.first_name ?? user.name?.split(' ')[0] ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
          paddingLeft: isMobile ? '16px' : '32px',
          paddingRight: isMobile ? '16px' : '32px',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: isMobile ? 0 : '40px', flexShrink: 0 }}>
          <Link href="/learn" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
              <span style={{ color: '#1a1a2e' }}>knew</span>
              <span style={{ color: '#0EA5E9' }}>ler</span>
            </div>
          </Link>
        </div>

        {/* Nav links — desktop */}
        {!isMobile && (
          <nav style={{ flex: 1, display: 'flex', alignItems: 'stretch', gap: '28px' }}>
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
        )}

        {/* Right: user + sign out — desktop */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '40px' }}>
            {firstName && (
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>{firstName}</span>
            )}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px',
                background: '#F0FDF4',
                color: '#15803D',
                border: '1px solid #BBF7D0',
                textTransform: 'capitalize',
              }}
            >
              Student
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
        )}

        {/* Mobile: hamburger */}
        {isMobile && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              <span style={{ display: 'block', width: '22px', height: '2px', background: menuOpen ? '#0369A1' : '#374151', borderRadius: '2px', transition: 'background 0.15s' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: menuOpen ? '#0369A1' : '#374151', borderRadius: '2px', transition: 'background 0.15s' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: menuOpen ? '#0369A1' : '#374151', borderRadius: '2px', transition: 'background 0.15s' }} />
            </button>
          </div>
        )}
      </header>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: 'sticky',
            top: '60px',
            zIndex: 99,
            background: '#ffffff',
            borderBottom: '1px solid #E2E8F0',
            width: '100%',
          }}
        >
          {NAV_LINKS.map(({ label, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'block',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#0369A1' : '#374151',
                  textDecoration: 'none',
                  borderLeft: active ? '3px solid #0369A1' : '3px solid transparent',
                  background: active ? '#F0F9FF' : 'transparent',
                }}
              >
                {label}
              </Link>
            );
          })}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 24px',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {firstName && <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>{firstName}</span>}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: '#F0FDF4',
                  color: '#15803D',
                  border: '1px solid #BBF7D0',
                  textTransform: 'capitalize',
                }}
              >
                Student
              </span>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                padding: '6px 14px',
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
        </div>
      )}

      <main style={{ flex: 1, background: '#F8FAFC' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            padding: isMobile ? '16px' : '32px',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
