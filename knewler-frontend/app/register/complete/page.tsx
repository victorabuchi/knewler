'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

const INSTITUTION_TYPES = [
  { value: 'university', label: 'University' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'sports_club', label: 'Sports Club' },
  { value: 'school', label: 'School' },
  { value: 'other', label: 'Other' },
];

function RegisterCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const googleToken = searchParams.get('google_token') ?? '';
  const email = searchParams.get('email') ?? '';
  const firstName = searchParams.get('first_name') ?? '';
  const lastName = searchParams.get('last_name') ?? '';

  const [institutionName, setInstitutionName] = useState('');
  const [type, setType] = useState('university');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!googleToken || !email) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#DC2626', fontSize: '0.9375rem' }}>
          Invalid session. <a href="/register" style={{ color: '#0369A1' }}>Start over</a>
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register/google', {
        google_token: googleToken,
        institution_name: institutionName,
        type,
        first_name: firstName,
        last_name: lastName,
        email,
      });
      login(res.data.token, res.data.user);
      localStorage.setItem('knewler_tenant', JSON.stringify(res.data.tenant));
      router.push('/onboarding');
    } catch (err: unknown) {
      const message = err instanceof Error
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? err.message
        : 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false);
    }
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
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#1a1a2e' }}>knew</span>
            <span style={{ color: '#0EA5E9' }}>ler</span>
          </div>
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            One last step — tell us about your institution
          </p>
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
          {/* Google account pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.625rem 0.875rem',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.2z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.5 42.6 14.7 48 24 48z"/>
              <path fill="#FBBC05" d="M10.8 28.8A14.8 14.8 0 0 1 10 24c0-1.7.3-3.3.8-4.8v-6.2H2.6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l8.2-6z"/>
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.9 2.4 30.5 0 24 0 14.7 0 6.5 5.4 2.6 13.2l8.2 6.2C12.7 13.6 17.9 9.5 24 9.5z"/>
            </svg>
            <span style={{ fontSize: '0.875rem', color: '#475569' }}>
              Signed in as <strong style={{ color: '#1a1a2e' }}>{email}</strong>
            </span>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name row (read-only from Google) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input
                  type="text"
                  value={firstName}
                  readOnly
                  style={{ ...inputStyle, background: '#F8FAFC', color: '#64748B', cursor: 'default' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input
                  type="text"
                  value={lastName}
                  readOnly
                  style={{ ...inputStyle, background: '#F8FAFC', color: '#64748B', cursor: 'default' }}
                />
              </div>
            </div>

            {/* Email (locked) */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                readOnly
                style={{ ...inputStyle, background: '#F8FAFC', color: '#64748B', cursor: 'default' }}
              />
            </div>

            {/* Institution name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Institution name</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
                placeholder="e.g. Acme University"
                autoComplete="organization"
                style={inputStyle}
              />
            </div>

            {/* Institution type */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Institution type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                style={inputStyle}
              >
                {INSTITUTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
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
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Creating your space…' : 'Launch Knewler'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterCompletePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>
        </div>
      }
    >
      <RegisterCompleteContent />
    </Suspense>
  );
}
