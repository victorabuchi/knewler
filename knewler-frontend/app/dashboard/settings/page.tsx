'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

// ─── types ───────────────────────────────────────────────────────────────────

interface Tenant {
  name: string;
  type: string;
  custom_domain: string | null;
  domain_verified: boolean;
  plan: string;
}

// ─── plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: '$0',
    features: ['Up to 3 courses', '50 students', 'Basic exams', 'Community support'],
    cta: null,
  },
  {
    key: 'starter',
    label: 'Starter',
    price: '$29/mo',
    features: ['Up to 20 courses', '500 students', 'Advanced exams', 'Email support'],
    cta: 'Upgrade to Starter',
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '$79/mo',
    features: ['Unlimited courses', '5 000 students', 'Custom domain', 'Priority support'],
    cta: 'Upgrade to Pro',
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited everything', 'SSO & SCIM', 'Dedicated infra', 'SLA + CSM'],
    cta: 'Contact sales',
  },
];

const PLAN_BADGE: Record<string, React.CSSProperties> = {
  free: { background: '#F1F5F9', color: '#475569' },
  starter: { background: '#DBEAFE', color: '#1D4ED8' },
  pro: { background: '#F3E8FF', color: '#6B21A8' },
  enterprise: { background: '#FEF9C3', color: '#854D0E' },
};

const INSTITUTION_TYPES = [
  { value: 'university', label: 'University' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'sports_club', label: 'Sports Club' },
  { value: 'school', label: 'School' },
  { value: 'other', label: 'Other' },
];

const SECTIONS = ['general', 'domain', 'billing'] as const;
type Section = (typeof SECTIONS)[number];

// ─── shared styles ────────────────────────────────────────────────────────────

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

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '2rem',
  maxWidth: '600px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

// ─── General section ──────────────────────────────────────────────────────────

function GeneralSection({ tenant }: { tenant: Tenant }) {
  const [name, setName] = useState(tenant.name);
  const [type, setType] = useState(tenant.type);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put('/api/settings/general', { name, type });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(msg || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a2e' }}>
        General
      </h2>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Institution name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={labelStyle}>Institution type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
            {INSTITUTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{ padding: '0.625rem 1.5rem', background: saving ? '#93C5FD' : '#0369A1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

// ─── Domain section ───────────────────────────────────────────────────────────

function DomainSection({ tenant }: { tenant: Tenant }) {
  const [domain, setDomain] = useState(tenant.custom_domain ?? '');
  const [verified, setVerified] = useState(tenant.domain_verified);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [error, setError] = useState('');

  async function handleSaveDomain(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaveMsg('');
    setSaving(true);
    try {
      await api.post('/api/settings/domain', { custom_domain: domain });
      setSaveMsg('Domain saved.');
      setVerified(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(msg || 'Failed to save domain.');
    } finally {
      setSaving(false);
    }
  }

  async function handleVerify() {
    setVerifyMsg('');
    setError('');
    setVerifying(true);
    try {
      const res = await api.post('/api/settings/domain/verify', {});
      setVerified(res.data.verified);
      setVerifyMsg(res.data.verified ? 'Domain verified successfully.' : 'CNAME record not found yet. DNS changes can take up to 48 hours to propagate.');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(msg || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a2e' }}>
        Custom Domain
      </h2>

      {/* Current status */}
      {tenant.custom_domain && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.9375rem', color: '#1a1a2e', flex: 1 }}>
            {tenant.custom_domain}
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '999px', background: verified ? '#DCFCE7' : '#FEF3C7', color: verified ? '#166534' : '#92400E' }}>
            {verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSaveDomain}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Custom domain</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="learn.yourinstitution.com"
            style={inputStyle}
          />
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#374151' }}>Setup instructions</p>
          <p style={{ margin: '0 0 0.35rem' }}>1. Enter your domain and click Save.</p>
          <p style={{ margin: '0 0 0.35rem' }}>2. In your DNS provider, add a CNAME record:</p>
          <p style={{ margin: '0 0 0.35rem', fontFamily: 'monospace', background: '#ffffff', padding: '0.35rem 0.625rem', borderRadius: '4px', display: 'inline-block' }}>
            {domain || 'your-domain.com'} → cname.knewler.com
          </p>
          <p style={{ margin: '0.5rem 0 0', color: '#64748B' }}>DNS changes can take up to 48 hours to propagate.</p>
        </div>

        {saveMsg && <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#166534' }}>{saveMsg}</p>}
        {verifyMsg && (
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: verified ? '#166534' : '#92400E' }}>
            {verifyMsg}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '0.625rem 1.25rem', background: saving ? '#93C5FD' : '#0369A1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Saving…' : 'Save domain'}
          </button>
          {domain && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying}
              style={{ padding: '0.625rem 1.25rem', background: '#ffffff', color: '#0369A1', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: verifying ? 'not-allowed' : 'pointer' }}
            >
              {verifying ? 'Checking…' : 'Verify domain'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Billing section ──────────────────────────────────────────────────────────

function BillingSection({ tenant }: { tenant: Tenant }) {
  const plan = tenant.plan ?? 'free';

  return (
    <div>
      {/* Current plan */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem', maxWidth: '600px' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a2e' }}>
          Current plan
        </h2>
        <span style={{ padding: '0.3rem 0.875rem', borderRadius: '999px', fontSize: '0.9375rem', fontWeight: 700, textTransform: 'capitalize', ...(PLAN_BADGE[plan] ?? PLAN_BADGE.free) }}>
          {plan}
        </span>
      </div>

      {/* Plan comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          maxWidth: '900px',
        }}
      >
        {PLANS.map((p) => {
          const isCurrent = p.key === plan;
          return (
            <div
              key={p.key}
              style={{
                background: '#ffffff',
                border: isCurrent ? '2px solid #0369A1' : '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.9375rem', color: '#1a1a2e' }}>
                {p.label}
              </p>
              <p style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 700, color: '#0369A1' }}>
                {p.price}
              </p>
              <ul style={{ margin: '0 0 1.25rem', padding: '0 0 0 1rem', listStyle: 'disc', flex: 1 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.35rem' }}>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span style={{ display: 'block', textAlign: 'center', padding: '0.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, background: '#F1F5F9', color: '#64748B' }}>
                  Current plan
                </span>
              ) : p.cta ? (
                <button
                  style={{ padding: '0.5rem', background: '#0369A1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {p.cta}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings content (uses useSearchParams — must be inside Suspense) ────────

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get('section');
  const section: Section = SECTIONS.includes(raw as Section) ? (raw as Section) : 'general';

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/settings')
      .then((res) => setTenant(res.data.tenant))
      .catch(() => setError('Failed to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  function goTo(s: Section) {
    router.push(`/dashboard/settings?section=${s}`);
  }

  const tabBtn = (s: Section, label: string): React.CSSProperties => ({
    padding: '0.5rem 1.125rem',
    background: section === s ? '#0369A1' : '#ffffff',
    color: section === s ? '#ffffff' : '#475569',
    border: section === s ? '1px solid #0369A1' : '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.25rem' }}>
          Settings
        </h1>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
          Manage your institution settings
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['general', 'domain', 'billing'] as Section[]).map((s) => (
          <button key={s} onClick={() => goTo(s)} style={tabBtn(s, s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>}

      {!loading && error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && tenant && (
        <>
          {section === 'general' && <GeneralSection tenant={tenant} />}
          {section === 'domain' && <DomainSection tenant={tenant} />}
          {section === 'billing' && <BillingSection tenant={tenant} />}
        </>
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <Suspense fallback={<p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>}>
      <SettingsContent />
    </Suspense>
  );
}
