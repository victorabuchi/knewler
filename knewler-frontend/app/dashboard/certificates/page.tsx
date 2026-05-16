'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Certificate {
  id: string;
  student_name: string;
  course_title: string;
  issued_at: string;
  verify_code: string;
  cert_url: string | null;
}

function CertIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#CA8A04"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/api/certificates')
      .then((res) => setCerts(res.data.certificates))
      .catch(() => setError('Failed to load certificates.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.25rem' }}>
          Certificates
        </h1>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
          Track and issue completion certificates
        </p>
      </div>

      {loading && <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>}

      {!loading && error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && certs.length === 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B', maxWidth: '400px', marginInline: 'auto' }}>
            No certificates issued yet. Certificates are awarded automatically when students complete a course.
          </p>
        </div>
      )}

      {!loading && !error && certs.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Student', 'Course', 'Issued', 'Verify code', 'Actions'].map((col) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {certs.map((cert) => (
                <tr
                  key={cert.id}
                  onMouseEnter={() => setHoveredRow(cert.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    background: hoveredRow === cert.id ? '#F8FAFC' : '#ffffff',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Student */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CertIcon />
                      <span style={{ fontWeight: 500, color: '#1a1a2e', fontSize: '0.9375rem' }}>
                        {cert.student_name}
                      </span>
                    </div>
                  </td>

                  {/* Course */}
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#475569' }}>
                    {cert.course_title}
                  </td>

                  {/* Issued date */}
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#475569' }}>
                    {new Date(cert.issued_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Verify code */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.8125rem',
                        color: '#64748B',
                        background: '#F8FAFC',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                        maxWidth: '130px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                      }}
                    >
                      {cert.verify_code}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {cert.cert_url ? (
                        <a
                          href={cert.cert_url}
                          target="_blank"
                          rel="noopener noreferrer"
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
                          Download
                        </a>
                      ) : (
                        <span
                          style={{
                            padding: '0.4rem 0.875rem',
                            background: '#F1F5F9',
                            color: '#94A3B8',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'not-allowed',
                          }}
                        >
                          Download
                        </span>
                      )}
                      <a
                        href={`/verify/${cert.verify_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.4rem 0.875rem',
                          background: '#FEF9C3',
                          color: '#854D0E',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Verify
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
