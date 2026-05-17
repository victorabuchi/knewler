import Link from 'next/link';

export default function StaffPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, Arial, sans-serif', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '440px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
            <path d="M23 21V19C23 17.13 21.74 15.56 20 15.13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 3.13C17.74 3.56 19 5.13 19 7C19 8.87 17.74 10.44 16 10.87" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span style={{ color: '#1a1a2e' }}>knew</span>
          <span style={{ color: '#0EA5E9' }}>ler</span>
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Staff Portal
        </h1>
        <p style={{ margin: '0 0 8px', fontSize: '15px', color: '#64748B', lineHeight: 1.6 }}>
          Coming soon.
        </p>
        <p style={{ margin: '0 0 32px', fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
          The staff portal is under construction. Check back soon.
        </p>
        <Link href="/login" style={{ display: 'inline-block', padding: '10px 24px', background: '#0369A1', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
