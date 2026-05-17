'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, getUserRole } from '@/lib/auth';
import { useWindowWidth } from '@/lib/useWindowWidth';

const STUDIES_LINKS = [
  { label: 'My Enrollments', href: '/enrollments' },
  { label: 'Study Guide', href: '/study-guide' },
  { label: 'PSP', href: '/psp' },
  { label: 'Credits', href: '/credits' },
  { label: 'Curriculum', href: '/curriculum' },
];

const NAV_LINKS = [
  { label: 'Home Page', href: '/' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'ATOMI', href: '/atomi' },
  { label: 'Accessibility Statement', href: '/accessibility' },
  { label: 'Course Feedback', href: '/feedback' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const width = useWindowWidth();
  const isMobile = width < 1024;
  const [studiesOpen, setStudiesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const studiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStudiesOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login';
      return;
    }
    if (!isLoading && user) {
      const role = getUserRole();
      if (role === 'admin' || role === 'teacher') {
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (studiesRef.current && !studiesRef.current.contains(e.target as Node)) {
        setStudiesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSignOut() {
    logout();
    localStorage.removeItem('knewler_tenant');
    window.location.href = '/login';
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/' || pathname === '/student';
    return pathname === href || pathname.startsWith(href + '/') ||
      pathname === `/student${href}` || pathname.startsWith(`/student${href}/`);
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#0369A1', fontSize: '1rem', fontWeight: 500 }}>Loading…</span>
      </div>
    );
  }

  if (!user) return null;

  const role = getUserRole();
  if (role === 'admin' || role === 'teacher') return null;

  const userObj = user as (typeof user & { first_name?: string; last_name?: string });
  const firstName = userObj?.first_name ?? user.name?.split(' ')[0] ?? '';
  const lastName = userObj?.last_name ?? user.name?.split(' ')[1] ?? '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

  const tenantRaw = typeof window !== 'undefined' ? localStorage.getItem('knewler_tenant') : null;
  const tenant = tenantRaw ? (() => { try { return JSON.parse(tenantRaw); } catch { return null; } })() : null;
  const institutionName: string = tenant?.name ?? 'My Institution';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F9FF' }}>
      {/* Top nav */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          height: '56px',
          background: '#ffffff',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: isMobile ? '16px' : '24px',
          paddingRight: isMobile ? '16px' : '24px',
          gap: '0',
        }}
      >
        {/* Institution identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginRight: isMobile ? 'auto' : '32px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#0E7490',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {/* Graduation cap SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 9L12 4L2 9L12 14L22 9Z" fill="white"/>
              <path d="M6 11.5V16.5C6 16.5 8.5 19 12 19C15.5 19 18 16.5 18 16.5V11.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 9V14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          {!isMobile && (
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
                {institutionName}
              </span>
            </Link>
          )}
        </div>

        {/* Nav links — desktop */}
        {!isMobile && (
          <nav style={{ flex: 1, display: 'flex', alignItems: 'stretch', height: '100%', gap: '4px' }}>
            {/* Home */}
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                fontSize: '13px',
                fontWeight: 500,
                color: isActive('/') ? '#0E7490' : '#374151',
                textDecoration: 'none',
                borderBottom: isActive('/') ? '2px solid #0E7490' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Home Page
            </Link>

            {/* Studies dropdown */}
            <div ref={studiesRef} style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
              <button
                onClick={() => setStudiesOpen((o) => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: STUDIES_LINKS.some(l => isActive(l.href)) ? '#0E7490' : '#374151',
                  background: 'none',
                  border: 'none',
                  borderBottom: STUDIES_LINKS.some(l => isActive(l.href)) ? '2px solid #0E7490' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  height: '100%',
                }}
              >
                Studies
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop: '1px', transform: studiesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {studiesOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '56px',
                    left: 0,
                    background: '#ffffff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    minWidth: '180px',
                    zIndex: 300,
                    overflow: 'hidden',
                  }}
                >
                  {STUDIES_LINKS.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: isActive(href) ? 600 : 400,
                        color: isActive(href) ? '#0E7490' : '#374151',
                        textDecoration: 'none',
                        background: isActive(href) ? '#F0FDFA' : 'transparent',
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Remaining nav links */}
            {NAV_LINKS.slice(1).map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: isActive(href) ? '#0E7490' : '#374151',
                  textDecoration: 'none',
                  borderBottom: isActive(href) ? '2px solid #0E7490' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: isMobile ? 0 : 'auto' }}>
          {/* Language switcher */}
          {!isMobile && (
            <button
              style={{
                padding: '4px 10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                color: '#374151',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              EN
            </button>
          )}

          {/* Avatar with initials */}
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={handleSignOut}
            title="Sign out"
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0E7490',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.03em',
                userSelect: 'none',
              }}
            >
              {initials}
            </div>
          </div>

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#374151', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#374151', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#374151', borderRadius: '2px' }} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: 'sticky',
            top: '56px',
            zIndex: 199,
            background: '#ffffff',
            borderBottom: '1px solid #E2E8F0',
            width: '100%',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'block',
              padding: '13px 20px',
              fontSize: '14px',
              fontWeight: isActive('/') ? 600 : 500,
              color: isActive('/') ? '#0E7490' : '#374151',
              textDecoration: 'none',
              borderLeft: isActive('/') ? '3px solid #0E7490' : '3px solid transparent',
              background: isActive('/') ? '#F0FDFA' : 'transparent',
            }}
          >
            Home Page
          </Link>

          {/* Studies section */}
          <div style={{ padding: '4px 0' }}>
            <div style={{ padding: '8px 20px 4px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Studies
            </div>
            {STUDIES_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'block',
                  padding: '10px 20px 10px 28px',
                  fontSize: '14px',
                  fontWeight: isActive(href) ? 600 : 400,
                  color: isActive(href) ? '#0E7490' : '#374151',
                  textDecoration: 'none',
                  background: isActive(href) ? '#F0FDFA' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {NAV_LINKS.slice(1).map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '13px 20px',
                fontSize: '14px',
                fontWeight: isActive(href) ? 600 : 500,
                color: isActive(href) ? '#0E7490' : '#374151',
                textDecoration: 'none',
                borderLeft: isActive(href) ? '3px solid #0E7490' : '3px solid transparent',
                background: isActive(href) ? '#F0FDFA' : 'transparent',
              }}
            >
              {label}
            </Link>
          ))}

          <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>
              {firstName} {lastName}
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
        </div>
      )}

      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
