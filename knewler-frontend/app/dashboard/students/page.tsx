'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  enrolled_at: string | null;
  created_at: string;
}

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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/api/students')
      .then((res) => setStudents(res.data.students))
      .catch(() => setError('Failed to load students.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    const full = `${s.first_name} ${s.last_name}`.toLowerCase();
    return full.includes(q) || s.email.toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: '0 0 0.25rem',
          }}
        >
          Students
        </h1>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
          Manage your institution&apos;s students
        </p>
      </div>

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <input
          type="search"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            maxWidth: '360px',
            padding: '0.625rem 0.75rem',
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            color: '#1a1a2e',
            fontSize: '0.9375rem',
            outline: 'none',
          }}
        />
        <Link
          href="/dashboard/students/new"
          style={{
            padding: '0.625rem 1.25rem',
            background: '#0369A1',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Add Student
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#DC2626',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && students.length === 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
            No students yet. Add your first student to get started.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && students.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Name', 'Email', 'Role', 'Status', 'Enrolled', 'Actions'].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      color: '#64748B',
                      fontSize: '0.9375rem',
                    }}
                  >
                    No students match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr
                    key={student.id}
                    onMouseEnter={() => setHoveredRow(student.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '1px solid #E2E8F0',
                      background:
                        hoveredRow === student.id ? '#F8FAFC' : '#ffffff',
                      transition: 'background 0.1s',
                    }}
                  >
                    {/* Name + avatar */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#0369A1',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials(student)}
                        </div>
                        <span
                          style={{
                            fontWeight: 500,
                            color: '#1a1a2e',
                            fontSize: '0.9375rem',
                          }}
                        >
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td
                      style={{
                        padding: '0.875rem 1rem',
                        fontSize: '0.9375rem',
                        color: '#475569',
                      }}
                    >
                      {student.email}
                    </td>

                    {/* Role */}
                    <td
                      style={{
                        padding: '0.875rem 1rem',
                        fontSize: '0.9375rem',
                        color: '#475569',
                      }}
                    >
                      {ROLE_LABELS[student.role] ?? student.role}
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: student.is_active ? '#DCFCE7' : '#F1F5F9',
                          color: student.is_active ? '#166534' : '#475569',
                        }}
                      >
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Enrolled date */}
                    <td
                      style={{
                        padding: '0.875rem 1rem',
                        fontSize: '0.9375rem',
                        color: '#94A3B8',
                      }}
                    >
                      {student.created_at
                        ? new Date(student.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Link
                        href={`/dashboard/students/${student.id}`}
                        style={{
                          padding: '0.4rem 0.875rem',
                          background: '#F1F5F9',
                          color: '#0369A1',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
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
    </div>
  );
}
