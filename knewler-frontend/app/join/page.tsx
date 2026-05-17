'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

interface Invitation {
  id: string;
  email: string;
  first_name: string | null;
  role: string;
  institution_name: string;
  expires_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.2z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.5 42.6 14.7 48 24 48z"/>
      <path fill="#FBBC05" d="M10.8 28.8A14.8 14.8 0 0 1 10 24c0-1.7.3-3.3.8-4.8v-6.2H2.6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l8.2-6z"/>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.9 2.4 30.5 0 24 0 14.7 0 6.5 5.4 2.6 13.2l8.2 6.2C12.7 13.6 17.9 9.5 24 9.5z"/>
    </svg>
  );
}

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifyError('No invitation token found.');
      setVerifying(false);
      return;
    }

    api
      .get(`/api/invitations/verify?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setInvitation(res.data.invitation);
        if (res.data.invitation.first_name) {
          setFirstName(res.data.invitation.first_name);
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.error ?? 'This invitation is invalid or has expired.';
        setVerifyError(msg);
      })
      .finally(() => setVerifying(false));
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!invitation) return;
    setSubmitError('');
    setLoading(true);
    try {
      const res = await api.post('/api/invitations/accept', {
        token,
        first_name: firstName,
        last_name: lastName,
        password,
      });
      localStorage.setItem('knewler_token', res.data.token);
      localStorage.setItem('knewler_user', JSON.stringify(res.data.user));
      localStorage.setItem('knewler_tenant', JSON.stringify(res.data.tenant));
      localStorage.setItem('knewler_role', res.data.user?.role ?? '');
      const role: string = res.data.user?.role ?? '';
      if (role === 'student' || role === 'staff') {
        router.push('/learn');
      } else if (role === 'admin' || role === 'teacher') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? err.message
        : 'Failed to accept invitation. Please try again.'
      setSubmitError(message)
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleAccept() {
    if (!token) return;
    localStorage.setItem('knewler_invite_token', token);
    localStorage.setItem('knewler_oauth_intent', 'login');
    window.location.href =
      (process.env.NEXT_PUBLIC_API_URL || 'https://knewler-backend.onrender.com') +
      '/api/auth/google?intent=login';
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    background: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    color: '#1a1a2e',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '0.4rem',
    color: '#374151',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#1a1a2e' }}>knew</span>
            <span style={{ color: '#0EA5E9' }}>ler</span>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {/* Verifying */}
          {verifying && (
            <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.9375rem', margin: 0 }}>
              Verifying invitation…
            </p>
          )}

          {/* Invalid invitation */}
          {!verifying && verifyError && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#DC2626', fontSize: '0.9375rem', marginBottom: '1rem' }}>
                {verifyError}
              </p>
              <a
                href="/login"
                style={{ color: '#0369A1', fontSize: '0.9375rem', textDecoration: 'none', fontWeight: 500 }}
              >
                Go to login
              </a>
            </div>
          )}

          {/* Valid invitation */}
          {!verifying && !verifyError && invitation && (
            <>
              {/* Invitation header */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.375rem', fontSize: '1.125rem', fontWeight: 700, color: '#1a1a2e' }}>
                  You&apos;ve been invited
                </p>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B', lineHeight: 1.5 }}>
                  Join <strong style={{ color: '#1a1a2e' }}>{invitation.institution_name}</strong> as a{' '}
                  <span
                    style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      background: '#DBEAFE',
                      color: '#1D4ED8',
                    }}
                  >
                    {ROLE_LABELS[invitation.role] ?? invitation.role}
                  </span>
                </p>
              </div>

              {/* Google option */}
              <button
                type="button"
                onClick={handleGoogleAccept}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  marginBottom: '1.25rem',
                }}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              </div>

              {/* Password form */}
              {submitError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: '0.875rem' }}>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleAccept}>
                {/* Email (locked) */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={invitation.email}
                    readOnly
                    style={{ ...inputStyle, background: '#F8FAFC', color: '#64748B', cursor: 'default' }}
                  />
                </div>

                {/* Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={labelStyle}>Create a password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: loading ? '#93C5FD' : '#0369A1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Joining…' : 'Accept invitation'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
