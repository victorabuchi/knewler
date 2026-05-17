import Link from 'next/link';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Set up your institution',
    body: 'Register in minutes. Add your courses, staff, and students. Everything is multi-tenant and isolated from day one.',
  },
  {
    step: '02',
    title: 'Deliver and assess',
    body: 'Publish course modules, schedule live sessions, and run timed exams with auto-grading and anti-cheat controls.',
  },
  {
    step: '03',
    title: 'Track and certify',
    body: 'Monitor progress in real time. Issue certificates automatically when students hit your completion criteria.',
  },
];

const AUDIENCES = [
  {
    label: 'Universities',
    color: '#0369A1',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    body: 'Manage curricula, enrolments, and assessments across every faculty. Built for academic rigour at scale.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M22 9L12 4L2 9L12 14L22 9Z" fill="currentColor" />
        <path d="M6 11.5V16C6 16 8.5 19 12 19C15.5 19 18 16 18 16V11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 9V14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Companies',
    color: '#0E7490',
    bg: '#F0FDFA',
    border: '#99F6E4',
    body: 'Onboard employees, run compliance training, and upskill teams — with scheduling and certification built in.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 12V16M10 14H14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Sports Clubs',
    color: '#15803D',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    body: 'Share playbooks, tactics, and video sessions with your squad. Keep coaches and athletes in perfect sync.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 3C12 3 9 7 9 12C9 17 12 21 12 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 3C12 3 15 7 15 12C15 17 12 21 12 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M3 12H21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    description: 'For small teams getting started.',
    features: ['Up to 25 users', '3 courses', 'Basic exams', 'Email support'],
    cta: 'Get started free',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '€49',
    period: 'per month',
    description: 'For growing institutions.',
    features: ['Up to 200 users', 'Unlimited courses', 'Exams + certificates', 'Schedule & calendar', 'Priority support'],
    cta: 'Start free trial',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '€149',
    period: 'per month',
    description: 'For serious learning operations.',
    features: ['Unlimited users', 'Everything in Starter', 'Student & staff portals', 'Custom subdomain', 'SSO / Google OAuth', 'Dedicated support'],
    cta: 'Start free trial',
    href: '/register',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organisations with custom needs.',
    features: ['Unlimited everything', 'SLA guarantee', 'Custom integrations', 'On-premise option', 'Dedicated CSM'],
    cta: 'Contact us',
    href: 'mailto:sales@knewler.com',
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', color: '#1a1a2e' }}>

      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #F1F5F9', height: '60px', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span style={{ color: '#1a1a2e' }}>knew</span>
          <span style={{ color: '#0EA5E9' }}>ler</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#how-it-works" style={{ fontSize: '14px', color: '#374151', textDecoration: 'none', fontWeight: 500 }}>How it works</a>
          <a href="#pricing" style={{ fontSize: '14px', color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Pricing</a>
          <Link href="/login" style={{ fontSize: '14px', color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          <Link href="/register" style={{ padding: '8px 18px', background: '#0369A1', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Get started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '999px', padding: '5px 14px', marginBottom: '28px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0369A1', display: 'inline-block' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>Now in early access</span>
        </div>

        <h1 style={{ margin: '0 0 20px', fontSize: '54px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#0F172A' }}>
          The complete eLearning platform<br />
          <span style={{ color: '#0369A1' }}>for every institution</span>
        </h1>

        <p style={{ margin: '0 0 40px', fontSize: '19px', color: '#64748B', lineHeight: 1.65, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Courses, exams, schedules, certificates, and student portals — all in one multi-tenant platform designed for universities, companies, and sports clubs.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ padding: '14px 32px', background: '#0369A1', color: '#ffffff', borderRadius: '10px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Get started free
          </Link>
          <a href="mailto:demo@knewler.com" style={{ padding: '14px 32px', background: '#ffffff', color: '#0F172A', borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none', border: '1px solid #E2E8F0', letterSpacing: '-0.01em' }}>
            Book a demo
          </a>
        </div>
        <p style={{ marginTop: '16px', fontSize: '13px', color: '#94A3B8' }}>No credit card required · Set up in minutes · Cancel any time</p>
      </section>

      {/* Feature strip */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '20px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '32px' }}>
          {['Course management', 'Timed exams', 'Auto-grading', 'Certificates', 'Live scheduling', 'Student portal', 'Multi-tenant', 'Google OAuth'].map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="7.5" fill="#DBEAFE" />
                <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {f}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth: '900px', margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>How it works</p>
          <h2 style={{ margin: '0', fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A' }}>Up and running in three steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#DBEAFE', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '12px' }}>{item.step}</div>
              <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{item.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748B', lineHeight: 1.7 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience cards */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '96px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Built for</p>
            <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A' }}>Every kind of learning organisation</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {AUDIENCES.map((a) => (
              <div key={a.label} style={{ background: a.bg, border: `1px solid ${a.border}`, borderRadius: '14px', padding: '28px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: a.color, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {a.icon}
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{a.label}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.65 }}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: '1040px', margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pricing</p>
          <h2 style={{ margin: '0 0 12px', fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A' }}>Simple, honest pricing</h2>
          <p style={{ margin: 0, fontSize: '16px', color: '#64748B' }}>Start free. Upgrade as you grow. No hidden fees.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'start' }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                border: plan.highlight ? '2px solid #0369A1' : '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '28px 24px',
                background: plan.highlight ? '#EFF6FF' : '#ffffff',
                position: 'relative',
              }}
            >
              {plan.highlight && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#0369A1', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '3px 12px', borderRadius: '999px', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>{plan.period}</span>}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>{plan.description}</p>
              </div>
              <ul style={{ margin: '0 0 24px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="7.5" cy="7.5" r="7.5" fill={plan.highlight ? '#BFDBFE' : '#F1F5F9'} />
                      <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke={plan.highlight ? '#0369A1' : '#64748B'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '11px 0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: plan.highlight ? '#0369A1' : '#ffffff',
                  color: plan.highlight ? '#ffffff' : '#0F172A',
                  border: plan.highlight ? 'none' : '1px solid #E2E8F0',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section style={{ background: 'linear-gradient(135deg, #0369A1 0%, #075985 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '36px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>Ready to get started?</h2>
        <p style={{ margin: '0 0 32px', fontSize: '17px', color: 'rgba(255,255,255,0.75)' }}>
          Join institutions already using Knewler to deliver better learning.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ padding: '14px 32px', background: '#ffffff', color: '#0369A1', borderRadius: '10px', fontSize: '16px', fontWeight: 700, textDecoration: 'none' }}>
            Get started free
          </Link>
          <a href="mailto:demo@knewler.com" style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
            Book a demo
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0F172A', padding: '48px 32px 32px', color: '#94A3B8' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                <span style={{ color: '#ffffff' }}>knew</span>
                <span style={{ color: '#0EA5E9' }}>ler</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, maxWidth: '220px' }}>
                The complete eLearning platform for every institution.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Product</div>
                {['Features', 'Pricing', 'Changelog'].map((l) => (
                  <div key={l} style={{ marginBottom: '8px' }}>
                    <a href="#" style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}>{l}</a>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Company</div>
                {['About', 'Blog', 'Contact'].map((l) => (
                  <div key={l} style={{ marginBottom: '8px' }}>
                    <a href="#" style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}>{l}</a>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Legal</div>
                {['Privacy', 'Terms', 'Security'].map((l) => (
                  <div key={l} style={{ marginBottom: '8px' }}>
                    <a href="#" style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}>{l}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '13px' }}>© {new Date().getFullYear()} Knewler. All rights reserved.</span>
            <span style={{ fontSize: '13px' }}>Made with care for learners everywhere.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
