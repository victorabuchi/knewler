'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');

    if (!token || !userRaw) {
      router.push('/login?error=oauth_failed');
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      localStorage.setItem('knewler_token', token);
      localStorage.setItem('knewler_user', JSON.stringify(user));
      localStorage.setItem('knewler_role', user.role ?? '');

      const role: string = user.role ?? '';
      if (role === 'student' || role === 'staff') {
        router.push('/learn');
      } else if (role === 'admin' || role === 'teacher') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/login?error=oauth_failed');
    }
  }, [router, searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          <span style={{ color: '#1a1a2e' }}>knew</span>
          <span style={{ color: '#0EA5E9' }}>ler</span>
        </div>
        <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Signing you in…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
