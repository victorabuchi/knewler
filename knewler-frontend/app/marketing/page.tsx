import Link from 'next/link';

const CARDS = [
  {
    title: 'For Universities',
    description:
      'Deliver courses, manage curricula, track student progress, and run assessments — all in one platform built for academic institutions.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 9L12 4L2 9L12 14L22 9Z" fill="#0369A1" />
        <path d="M6 11.5V16.5C6 16.5 8.5 19 12 19C15.5 19 18 16.5 18 16.5V11.5" stroke="#0369A1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 9V14" stroke="#0369A1" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
    accent: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    title: 'For Companies',
    description:
      'Onboard employees, run compliance training, and upskill teams with scheduled sessions and certifications — at any scale.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="#0E7490" strokeWidth="1.75" />
        <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="#0E7490" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 12V16M10 14H14" stroke="#0E7490" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
    accent: '#F0FDFA',
    border: '#99F6E4',
  },
  {
    title: 'For Sports Clubs',
    description:
      'Share playbooks, tactics, and video sessions with your squad. Keep coaches and athletes aligned with a portal built for performance.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#15803D" strokeWidth="1.75" />
        <path d="M12 3C12 3 9 7 9 12C9 17 12 21 12 21" stroke="#15803D" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 3C12 3 15 7 15 12C15 17 12 21 12 21" stroke="#15803D" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M3 12H21" stroke="#15803D" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
    accent: '#F0FDF4',
    border: '#BBF7D0',
  },
];

export default function MarketingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Nav */}
      <header
        style={{
          borderBottom: '1px solid #F1F5F9',
          padding: '0 32px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span style={{ color: '#1a1a2e' }}>knew</span>
          <span style={{ color: '#0EA5E9' }}>ler</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/login"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            style={{
              padding: '8px 18px',
              background: '#0369A1',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex: 1 }}>
        <section
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            padding: '80px 24px 64px',
            textAlign: 'center',
          }}
        >
          {/* Logo mark */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="56" height="56" rx="14" fill="#0369A1" />
              <path d="M38 20L28 15L18 20L28 25L38 20Z" fill="white" />
              <path
                d="M22 22.5V28.5C22 28.5 24.5 31 28 31C31.5 31 34 28.5 34 28.5V22.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M38 20V26" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 33H28" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 37H24" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Wordmark */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: '16px',
            }}
          >
            <span style={{ color: '#1a1a2e' }}>knew</span>
            <span style={{ color: '#0EA5E9' }}>ler</span>
          </div>

          <p
            style={{
              fontSize: '20px',
              color: '#64748B',
              margin: '0 0 40px',
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            From knowing to mastering
          </p>

          <p
            style={{
              fontSize: '16px',
              color: '#475569',
              margin: '0 0 40px',
              maxWidth: '540px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.7,
            }}
          >
            The learning management platform for institutions that take education seriously.
            Courses, exams, schedules, and certifications — all in one place.
          </p>

          <Link
            href="/register"
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: '#0369A1',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            Get started free
          </Link>
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#94A3B8' }}>
            No credit card required · Set up in minutes
          </p>
        </section>

        {/* Cards */}
        <section
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 24px 80px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {CARDS.map((card) => (
            <div
              key={card.title}
              style={{
                background: card.accent,
                border: `1px solid ${card.border}`,
                borderRadius: '14px',
                padding: '28px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                {card.icon}
              </div>
              <h3
                style={{
                  margin: '0 0 10px',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: 1.65,
                }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #F1F5F9',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '13px', color: '#94A3B8' }}>
          © {new Date().getFullYear()} Knewler
        </span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}>
            Sign in
          </Link>
          <Link href="/register" style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}>
            Register
          </Link>
        </div>
      </footer>
    </div>
  );
}
