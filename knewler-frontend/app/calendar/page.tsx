import Link from 'next/link';

export default function CalendarPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, Arial, sans-serif', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '440px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="white" strokeWidth="2" />
            <path d="M3 9H21" stroke="white" strokeWidth="2" />
            <path d="M8 2V6M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <rect x="7" y="12" width="3" height="3" rx="0.5" fill="white" />
            <rect x="11" y="12" width="3" height="3" rx="0.5" fill="white" />
            <rect x="7" y="16" width="3" height="3" rx="0.5" fill="white" />
          </svg>
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span style={{ color: '#1a1a2e' }}>knew</span>
          <span style={{ color: '#0EA5E9' }}>ler</span>
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Calendar
        </h1>
        <p style={{ margin: '0 0 8px', fontSize: '15px', color: '#64748B', lineHeight: 1.6 }}>
          Coming soon.
        </p>
        <p style={{ margin: '0 0 32px', fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
          The dedicated calendar portal is under construction. Schedules are available from your dashboard in the meantime.
        </p>
        <Link href="/login" style={{ display: 'inline-block', padding: '10px 24px', background: '#0369A1', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
