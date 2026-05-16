'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  first_name: string | null;
  role: string;
  created_at: string;
  expires_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(student: Student): string {
  const f = student.first_name?.[0] ?? '';
  const l = student.last_name?.[0] ?? '';
  return (f + l).toUpperCase() || student.email[0].toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
};

const TH_STYLE: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};

// ── Invite modal ──────────────────────────────────────────────────────────────

function InviteModal({
  onClose,
  onSent,
}: {
  onClose: () => void;
  onSent: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/invitations', { email, first_name: firstName, role });
      onSent(email);
    } catch (err: unknown) {
      const message = err instanceof Error
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? err.message
        : 'Failed to send invitation.'
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
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 200,
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '2rem',
          width: '100%',
          maxWidth: '440px',
          zIndex: 201,
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a2e' }}>
            Invite member
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.25rem', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="student@example.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>First name (optional)</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={labelStyle}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'student' | 'teacher')} style={inputStyle}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '0.625rem', background: loading ? '#93C5FD' : '#0369A1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Sending…' : 'Send invitation'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.625rem 1rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const [tab, setTab] = useState<'members' | 'invitations'>('members');

  // Members state
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState('');
  const [query, setQuery] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Invitations state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesError, setInvitesError] = useState('');

  // Invite modal state
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api
      .get('/api/students')
      .then((res) => setStudents(res.data.students))
      .catch(() => setStudentsError('Failed to load students.'))
      .finally(() => setStudentsLoading(false));
  }, []);

  function loadInvitations() {
    setInvitesLoading(true);
    setInvitesError('');
    api
      .get('/api/invitations')
      .then((res) => setInvitations(res.data.invitations))
      .catch(() => setInvitesError('Failed to load invitations.'))
      .finally(() => setInvitesLoading(false));
  }

  function handleTabChange(next: 'members' | 'invitations') {
    setTab(next);
    if (next === 'invitations') loadInvitations();
  }

  async function handleCancel(id: string) {
    try {
      await api.delete(`/api/invitations/${id}`);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    } catch {
      // silently ignore
    }
  }

  function handleInviteSent(email: string) {
    setShowModal(false);
    setSuccessMsg(`Invitation sent to ${email}`);
    setTimeout(() => setSuccessMsg(''), 5000);
    if (tab === 'invitations') loadInvitations();
  }

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    const full = `${s.first_name} ${s.last_name}`.toLowerCase();
    return full.includes(q) || s.email.toLowerCase().includes(q);
  });

  const tabBtn = (t: 'members' | 'invitations'): React.CSSProperties => ({
    padding: '0.5rem 1.125rem',
    background: tab === t ? '#0369A1' : '#ffffff',
    color: tab === t ? '#ffffff' : '#475569',
    border: tab === t ? '1px solid #0369A1' : '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <div>
      {/* Invite modal */}
      {showModal && (
        <InviteModal
          onClose={() => setShowModal(false)}
          onSent={handleInviteSent}
        />
      )}

      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.25rem' }}>
          Students
        </h1>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
          Manage your institution&apos;s students
        </p>
      </div>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <button onClick={() => handleTabChange('members')} style={tabBtn('members')}>Members</button>
          <button onClick={() => handleTabChange('invitations')} style={tabBtn('invitations')}>Pending Invitations</button>
        </div>

        {/* Actions */}
        {tab === 'members' && (
          <>
            <input
              type="search"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '220px',
                padding: '0.625rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#1a1a2e',
                fontSize: '0.9375rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => setShowModal(true)}
              style={{ padding: '0.625rem 1.25rem', background: '#ffffff', color: '#0369A1', border: '1px solid #0369A1', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Invite Student
            </button>
            <Link
              href="/dashboard/students/new"
              style={{ padding: '0.625rem 1.25rem', background: '#0369A1', color: '#ffffff', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none' }}
            >
              Add Student
            </Link>
          </>
        )}

        {tab === 'invitations' && (
          <button
            onClick={() => setShowModal(true)}
            style={{ padding: '0.625rem 1.25rem', background: '#0369A1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}
          >
            New Invitation
          </button>
        )}
      </div>

      {/* Success banner */}
      {successMsg && (
        <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#166534', fontSize: '0.875rem', fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      {/* ── Members tab ── */}
      {tab === 'members' && (
        <>
          {studentsLoading && <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>}

          {!studentsLoading && studentsError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
              {studentsError}
            </div>
          )}

          {!studentsLoading && !studentsError && students.length === 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
                No students yet. Add your first student to get started.
              </p>
            </div>
          )}

          {!studentsLoading && !studentsError && students.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Name', 'Email', 'Role', 'Status', 'Enrolled', 'Actions'].map((col) => (
                      <th key={col} style={TH_STYLE}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.9375rem' }}>
                        No students match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((student) => (
                      <tr
                        key={student.id}
                        onMouseEnter={() => setHoveredRow(student.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{ borderBottom: '1px solid #E2E8F0', background: hoveredRow === student.id ? '#F8FAFC' : '#ffffff', transition: 'background 0.1s' }}
                      >
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0369A1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0 }}>
                              {initials(student)}
                            </div>
                            <span style={{ fontWeight: 500, color: '#1a1a2e', fontSize: '0.9375rem' }}>
                              {student.first_name} {student.last_name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#475569' }}>{student.email}</td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#475569' }}>{ROLE_LABELS[student.role] ?? student.role}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: student.is_active ? '#DCFCE7' : '#F1F5F9', color: student.is_active ? '#166534' : '#475569' }}>
                            {student.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#94A3B8' }}>
                          {student.created_at
                            ? new Date(student.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <Link href={`/dashboard/students/${student.id}`} style={{ padding: '0.4rem 0.875rem', background: '#F1F5F9', color: '#0369A1', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Invitations tab ── */}
      {tab === 'invitations' && (
        <>
          {invitesLoading && <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>}

          {!invitesLoading && invitesError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
              {invitesError}
            </div>
          )}

          {!invitesLoading && !invitesError && invitations.length === 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
                No pending invitations.
              </p>
            </div>
          )}

          {!invitesLoading && !invitesError && invitations.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Email', 'Role', 'Sent', 'Expires', 'Actions'].map((col) => (
                      <th key={col} style={TH_STYLE}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <p style={{ margin: 0, fontWeight: 500, color: '#1a1a2e', fontSize: '0.9375rem' }}>{inv.email}</p>
                        {inv.first_name && <p style={{ margin: '0.1rem 0 0', fontSize: '0.8125rem', color: '#64748B' }}>{inv.first_name}</p>}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#F1F5F9', color: '#475569' }}>
                          {ROLE_LABELS[inv.role] ?? inv.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                        {new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#94A3B8' }}>
                        {new Date(inv.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button
                          onClick={() => handleCancel(inv.id)}
                          style={{ padding: '0.4rem 0.875rem', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
