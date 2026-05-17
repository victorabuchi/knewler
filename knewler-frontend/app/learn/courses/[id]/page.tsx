'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Module {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz' | 'text';
  content_url: string | null;
  content_body: string | null;
  position: number;
  completed: boolean;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  teacher_name: string;
  progress: number;
  modules: Module[];
}

const TYPE_META: Record<string, { bg: string; color: string; label: string }> = {
  video:  { bg: '#EFF6FF', color: '#0369A1', label: 'Video' },
  pdf:    { bg: '#FEF2F2', color: '#DC2626', label: 'PDF' },
  quiz:   { bg: '#FEF3C7', color: '#D97706', label: 'Quiz' },
  text:   { bg: '#F0FDF4', color: '#15803D', label: 'Reading' },
};

function TypeIcon({ type }: { type: string }) {
  if (type === 'video') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
  if (type === 'pdf') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
  if (type === 'quiz') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function getEmbedUrl(url: string): string | null {
  try {
    if (url.includes('youtube.com/watch')) {
      const v = new URL(url).searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (url.includes('youtu.be/')) {
      const v = url.split('youtu.be/')[1]?.split('?')[0];
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (url.includes('vimeo.com/')) {
      const v = url.split('vimeo.com/')[1]?.split('?')[0];
      return v ? `https://player.vimeo.com/video/${v}` : null;
    }
  } catch { /* invalid URL */ }
  return null;
}

function ModuleContent({ mod }: { mod: Module }) {
  if (mod.type === 'video') {
    if (!mod.content_url) return <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>No video URL provided.</p>;
    const embed = getEmbedUrl(mod.content_url);
    if (embed) {
      return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
            <iframe
              src={embed}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <video src={mod.content_url} controls style={{ width: '100%', borderRadius: '8px', background: '#000' }} />
      </div>
    );
  }

  if (mod.type === 'pdf') {
    if (!mod.content_url) return <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>No PDF URL provided.</p>;
    return (
      <iframe
        src={mod.content_url}
        title={mod.title}
        style={{ width: '100%', height: '600px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
      />
    );
  }

  if (mod.type === 'text') {
    if (!mod.content_body) return <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>No content available.</p>;
    return (
      <div
        style={{ maxWidth: '720px', lineHeight: 1.8, fontSize: '1rem', color: '#1a1a2e' }}
        dangerouslySetInnerHTML={{ __html: mod.content_body }}
      />
    );
  }

  // quiz
  return (
    <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
      <p style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#92400E', fontWeight: 600 }}>Quiz coming soon</p>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#B45309' }}>Interactive quizzes will be available in a future update.</p>
    </div>
  );
}

export default function CourseViewPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    api
      .get(`/api/learn/courses/${courseId}`)
      .then((r) => {
        const c: CourseDetail = r.data.course;
        setCourse(c);
        const firstIncomplete = c.modules.findIndex((m) => !m.completed);
        setActiveIdx(firstIncomplete >= 0 ? firstIncomplete : 0);
      })
      .catch(() => setError('Failed to load this course.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const activeModule = course?.modules[activeIdx] ?? null;
  const completedCount = course?.modules.filter((m) => m.completed).length ?? 0;
  const totalCount = course?.modules.length ?? 0;
  const typeMeta = TYPE_META[activeModule?.type ?? 'text'] ?? TYPE_META.text;

  async function handleMarkComplete() {
    if (!course || !activeModule || activeModule.completed || completing) return;
    setCompleting(true);
    try {
      const res = await api.post(`/api/learn/courses/${courseId}/modules/${activeModule.id}/complete`);
      setCourse((prev) => {
        if (!prev) return prev;
        const modules = prev.modules.map((m, i) => i === activeIdx ? { ...m, completed: true } : m);
        return { ...prev, modules, progress: res.data.progress ?? prev.progress };
      });
    } catch { /* silent */ } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#0369A1', fontSize: '1rem', fontWeight: 500 }}>Loading…</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: '#DC2626', fontSize: '0.9375rem' }}>{error || 'Course not found.'}</p>
        <Link href="/learn/courses" style={{ color: '#0369A1', fontSize: '0.875rem', textDecoration: 'none' }}>← Back to My Courses</Link>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>

      {/* Mini header */}
      <div
        style={{
          height: '52px',
          background: '#ffffff',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '16px',
          paddingRight: '24px',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <Link
          href="/learn/courses"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          My Courses
        </Link>
        <span style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>›</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {course.title}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div
          style={{
            width: '260px',
            background: '#ffffff',
            borderRight: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          {/* Course title block */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
            <p style={{ margin: '0 0 3px', fontSize: '0.8125rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.4 }}>
              {course.title}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
              {completedCount} of {totalCount} completed
            </p>
          </div>

          {/* Module list */}
          {course.modules.length === 0 ? (
            <div style={{ padding: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94A3B8' }}>No modules yet.</p>
            </div>
          ) : course.modules.map((mod, idx) => {
            const active = idx === activeIdx;
            const meta = TYPE_META[mod.type] ?? TYPE_META.text;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveIdx(idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 14px',
                  background: active ? '#EFF6FF' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${active ? '#0369A1' : 'transparent'}`,
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                {/* Position bubble */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: mod.completed ? '#059669' : active ? '#0369A1' : '#F1F5F9',
                    color: mod.completed || active ? '#ffffff' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {mod.completed ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : mod.position + 1}
                </div>

                {/* Title + type */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: '0 0 3px',
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#0369A1' : '#1a1a2e',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {mod.title}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.6875rem', color: meta.color, fontWeight: 500 }}>
                    <TypeIcon type={mod.type} />
                    {meta.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column' }}>
          {!activeModule ? (
            <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>Select a module to begin.</p>
          ) : (
            <>
              {/* Progress bar */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
                    {completedCount} of {totalCount} modules completed
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: '#0369A1', fontWeight: 600 }}>
                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                  </span>
                </div>
                <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
                      background: completedCount === totalCount && totalCount > 0 ? '#059669' : '#0369A1',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Module header */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 10px', fontSize: '1.375rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>
                  {activeModule.title}
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: typeMeta.bg,
                    color: typeMeta.color,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <TypeIcon type={activeModule.type} />
                  {typeMeta.label}
                </span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, marginBottom: '32px' }}>
                <ModuleContent mod={activeModule} />
              </div>

              {/* Bottom nav */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '24px',
                  borderTop: '1px solid #E2E8F0',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Previous */}
                <button
                  onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                  disabled={activeIdx === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ffffff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    color: activeIdx === 0 ? '#CBD5E1' : '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: activeIdx === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                  Previous
                </button>

                {/* Mark complete / Completed */}
                {activeModule.completed ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.5rem 1rem',
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '6px',
                      color: '#15803D',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Completed
                  </span>
                ) : (
                  <button
                    onClick={handleMarkComplete}
                    disabled={completing}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: completing ? '#93C5FD' : '#0369A1',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: completing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {completing ? 'Saving…' : 'Mark as Complete'}
                  </button>
                )}

                {/* Next */}
                <button
                  onClick={() => setActiveIdx((i) => Math.min(course.modules.length - 1, i + 1))}
                  disabled={activeIdx === course.modules.length - 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: activeIdx === course.modules.length - 1 ? '#ffffff' : '#0369A1',
                    border: activeIdx === course.modules.length - 1 ? '1px solid #E2E8F0' : 'none',
                    borderRadius: '6px',
                    color: activeIdx === course.modules.length - 1 ? '#CBD5E1' : '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: activeIdx === course.modules.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Next
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
