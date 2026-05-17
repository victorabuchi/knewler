'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { useWindowWidth } from '@/lib/useWindowWidth';

interface Message {
  id: number;
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
  sender_first_name: string | null;
  sender_last_name: string | null;
}

const FEATURE_CARDS = [
  {
    label: 'PSP',
    description: 'Personal Study Plan',
    href: '/psp',
    bg: '#1D4ED8',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" fill="white" opacity="0.9"/>
        <rect x="14" y="3" width="7" height="7" rx="1" fill="white" opacity="0.7"/>
        <rect x="3" y="14" width="7" height="7" rx="1" fill="white" opacity="0.7"/>
        <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity="0.5"/>
      </svg>
    ),
  },
  {
    label: 'Course Feedback',
    description: 'Rate your courses',
    href: '/feedback',
    bg: '#BE123C',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" opacity="0.9"/>
      </svg>
    ),
  },
  {
    label: 'Credits',
    description: 'View earned credits',
    href: '/credits',
    bg: '#15803D',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" opacity="0.9"/>
        <path d="M12 7V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      </svg>
    ),
  },
  {
    label: 'Study Guide',
    description: 'Degree requirements',
    href: '/study-guide',
    bg: '#B45309',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeWidth="2" opacity="0.9"/>
      </svg>
    ),
  },
  {
    label: 'Lukkarikone',
    description: 'Timetable generator',
    href: '/lukkarikone',
    bg: '#7C3AED',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="white" strokeWidth="2" opacity="0.9"/>
        <path d="M3 9H21" stroke="white" strokeWidth="2" opacity="0.7"/>
        <path d="M8 2V6M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
        <rect x="7" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.7"/>
        <rect x="11" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.7"/>
      </svg>
    ),
  },
  {
    label: 'Messages',
    description: 'Inbox & announcements',
    href: '/messages',
    bg: '#0E7490',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="white" strokeWidth="2" opacity="0.9"/>
        <path d="M22 6L12 13L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      </svg>
    ),
  },
];

const QUICK_LINKS = [
  { label: 'Library', href: '/library' },
  { label: 'IT Services', href: '/it' },
  { label: 'Student Affairs', href: '/affairs' },
  { label: 'Health Services', href: '/health' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function StudentHomePage() {
  const { user } = useAuth();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  useEffect(() => {
    api.get('/api/messages')
      .then((res) => setMessages(res.data.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, []);

  const tenantRaw = typeof window !== 'undefined' ? localStorage.getItem('knewler_tenant') : null;
  const tenant = tenantRaw ? (() => { try { return JSON.parse(tenantRaw); } catch { return null; } })() : null;
  const institutionName: string = tenant?.name ?? 'My Institution';

  const userObj = user as (typeof user & { first_name?: string; last_name?: string });
  const firstName = userObj?.first_name ?? user?.name?.split(' ')[0] ?? 'Student';

  const unreadCount = messages.filter((m) => !m.read).length;

  const cols = isMobile ? 2 : isTablet ? 3 : 3;
  const cardGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: isMobile ? '10px' : '14px',
  };

  return (
    <div>
      {/* Hero banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0369A1 0%, #075985 50%, #0E7490 100%)',
          padding: isMobile ? '28px 20px 32px' : '36px 48px 44px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <p style={{ margin: '0 0 4px', fontSize: isMobile ? '13px' : '14px', opacity: 0.8, fontWeight: 400 }}>
          {institutionName}
        </p>
        <h1 style={{ margin: '0 0 8px', fontSize: isMobile ? '24px' : '30px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ margin: 0, fontSize: isMobile ? '14px' : '15px', opacity: 0.75 }}>
          Your student portal — manage studies, track progress, and stay connected.
        </p>

        {unreadCount > 0 && (
          <Link
            href="/messages"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              padding: '7px 16px',
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '999px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="white" strokeWidth="2"/>
              <path d="M22 6L12 13L2 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Content area */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '20px 16px' : '28px 32px', boxSizing: 'border-box' }}>

        {/* Feature cards */}
        <section style={{ marginBottom: isMobile ? '28px' : '36px' }}>
          <div style={cardGridStyle}>
            {FEATURE_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: card.bg,
                    borderRadius: '12px',
                    padding: isMobile ? '20px 16px' : '24px 20px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s, transform 0.15s',
                    minHeight: isMobile ? '110px' : '130px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                >
                  <div>{card.icon}</div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 700, lineHeight: 1.2 }}>{card.label}</div>
                    {!isMobile && (
                      <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '3px' }}>{card.description}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3-column section */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr',
            gap: isMobile ? '16px' : '20px',
            marginBottom: isMobile ? '28px' : '36px',
          }}
        >
          {/* News */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>News</span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>Institution announcements</span>
            </div>
            {[
              { title: 'Semester registration opens May 20', date: '2 days ago' },
              { title: 'Library extended hours during exams', date: '4 days ago' },
              { title: 'Student council elections next week', date: '1 week ago' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 16px',
                  borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a2e', marginBottom: '3px', lineHeight: 1.4 }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.date}</div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Contact</span>
            </div>
            {[
              { label: 'Study Counselor', value: 'counselor@institution.edu', icon: '✉' },
              { label: 'IT Helpdesk', value: 'it@institution.edu', icon: '💻' },
              { label: 'Student Affairs', value: '+1 555 000 1234', icon: '📞' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 16px',
                  borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0, lineHeight: '20px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: '#1a1a2e' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Messages */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Messages</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: '#0E7490',
                    color: '#ffffff',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {messagesLoading ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>Loading…</div>
            ) : messages.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>No messages yet</div>
            ) : (
              messages.slice(0, 3).map((msg, i) => (
                <div
                  key={msg.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: i < Math.min(messages.length, 3) - 1 ? '1px solid #F1F5F9' : 'none',
                    background: !msg.read ? '#F0FDFA' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: !msg.read ? 600 : 500, color: '#1a1a2e', lineHeight: 1.4, flex: 1, minWidth: 0 }}>
                      {msg.subject || '(No subject)'}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {timeAgo(msg.created_at)}
                    </span>
                  </div>
                  {msg.sender_first_name && (
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                      From {msg.sender_first_name} {msg.sender_last_name ?? ''}
                    </div>
                  )}
                </div>
              ))
            )}
            {messages.length > 0 && (
              <Link
                href="/messages"
                style={{
                  display: 'block',
                  padding: '10px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0E7490',
                  textDecoration: 'none',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                View all messages →
              </Link>
            )}
          </div>
        </section>

        {/* Favourites / Quick links */}
        <section>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Quick Links</h2>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {QUICK_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '999px',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#0E7490'; (e.currentTarget as HTMLAnchorElement).style.color = '#0E7490'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; }}
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
