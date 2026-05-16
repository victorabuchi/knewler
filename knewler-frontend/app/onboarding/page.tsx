'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [institutionName, setInstitutionName] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('knewler_tenant');
    if (raw) {
      try {
        const tenant = JSON.parse(raw);
        setInstitutionName(tenant.name ?? tenant.institution_name ?? null);
      } catch {
        // corrupted storage — leave null
      }
    }

    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: '2rem',
        }}
      >
        <span style={{ color: '#1a1a2e' }}>knew</span>
        <span style={{ color: '#0EA5E9' }}>ler</span>
      </div>

      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#1a1a2e',
          margin: '0 0 0.75rem',
          letterSpacing: '-0.02em',
        }}
      >
        Welcome to Knewler
      </h1>

      {institutionName && (
        <p
          style={{
            fontSize: '1.125rem',
            color: '#0369A1',
            fontWeight: 600,
            margin: '0 0 1.25rem',
          }}
        >
          {institutionName}
        </p>
      )}

      <p
        style={{
          fontSize: '1rem',
          color: '#64748B',
          maxWidth: '380px',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        Your environment is being set up. You will be redirected to your dashboard shortly.
      </p>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2.5rem' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#0EA5E9',
              display: 'inline-block',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
