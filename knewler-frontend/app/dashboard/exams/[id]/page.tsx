'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Exam {
  id: string;
  title: string;
  course_title: string | null;
  duration_mins: number;
  pass_score: number;
  shuffle: boolean;
  tab_lock: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

interface Question {
  id: string;
  type: 'mcq' | 'essay' | 'true_false' | 'file_upload';
  body: string;
  points: number;
  options: { text: string; correct: boolean }[] | null;
  position: number;
}

const TYPE_LABELS: Record<string, string> = {
  mcq: 'MCQ',
  essay: 'Essay',
  true_false: 'True / False',
  file_upload: 'File Upload',
};

const TYPE_STYLE: Record<string, React.CSSProperties> = {
  mcq: { background: '#DBEAFE', color: '#1D4ED8' },
  essay: { background: '#FEF9C3', color: '#854D0E' },
  true_false: { background: '#DCFCE7', color: '#166534' },
  file_upload: { background: '#F3E8FF', color: '#6B21A8' },
};

const EMPTY_OPTIONS = ['', '', '', ''];

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examLoading, setExamLoading] = useState(true);
  const [qLoading, setQLoading] = useState(true);
  const [error, setError] = useState('');

  // Add question form state
  const [showForm, setShowForm] = useState(false);
  const [qType, setQType] = useState<'mcq' | 'essay' | 'true_false' | 'file_upload'>('mcq');
  const [qBody, setQBody] = useState('');
  const [qPoints, setQPoints] = useState(1);
  const [mcqOptions, setMcqOptions] = useState<string[]>([...EMPTY_OPTIONS]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [qError, setQError] = useState('');
  const [qLoading2, setQLoading2] = useState(false);

  useEffect(() => {
    api
      .get(`/api/exams/${id}`)
      .then((res) => setExam(res.data.exam))
      .catch(() => setError('Failed to load exam.'))
      .finally(() => setExamLoading(false));

    api
      .get(`/api/exams/${id}/questions`)
      .then((res) => setQuestions(res.data.questions))
      .catch(() => {})
      .finally(() => setQLoading(false));
  }, [id]);

  function resetForm() {
    setQType('mcq');
    setQBody('');
    setQPoints(1);
    setMcqOptions([...EMPTY_OPTIONS]);
    setCorrectIdx(0);
    setQError('');
    setShowForm(false);
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    setQError('');
    setQLoading2(true);
    try {
      const payload: Record<string, unknown> = {
        type: qType,
        body: qBody,
        points: qPoints,
      };
      if (qType === 'mcq') {
        payload.options = mcqOptions.map((text, i) => ({ text, correct: i === correctIdx }));
      }
      const res = await api.post(`/api/exams/${id}/questions`, payload);
      setQuestions((prev) => [...prev, res.data.question]);
      resetForm();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setQError(message || 'Failed to add question.');
    } finally {
      setQLoading2(false);
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

  if (examLoading) {
    return <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading…</p>;
  }

  if (error || !exam) {
    return (
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
        {error || 'Exam not found.'}
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link href="/dashboard/exams" style={{ fontSize: '0.875rem', color: '#0369A1', textDecoration: 'none', display: 'inline-block', marginBottom: '1.25rem' }}>
        ← Back to Exams
      </Link>

      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.25rem' }}>
          {exam.title}
        </h1>
        {exam.course_title && (
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>{exam.course_title}</p>
        )}
      </div>

      {/* Exam details card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          ['Duration', `${exam.duration_mins} minutes`],
          ['Pass score', `${exam.pass_score}%`],
          ['Shuffle', exam.shuffle ? 'Yes' : 'No'],
          ['Tab lock', exam.tab_lock ? 'Enabled' : 'Disabled'],
          ...(exam.starts_at ? [['Starts', new Date(exam.starts_at).toLocaleString('en-GB')]] : []),
          ...(exam.ends_at ? [['Ends', new Date(exam.ends_at).toLocaleString('en-GB')]] : []),
        ].map(([label, value]) => (
          <div key={label as string}>
            <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </p>
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#1a1a2e' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Question bank header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1a1a2e' }}>
          Question Bank
          <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontWeight: 400, color: '#64748B' }}>
            ({questions.length})
          </span>
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: '0.5rem 1rem', background: '#0369A1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Add Question
          </button>
        )}
      </div>

      {/* Question list */}
      {qLoading && <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Loading questions…</p>}

      {!qLoading && questions.length === 0 && !showForm && (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9375rem' }}>
            No questions yet. Add the first question to this exam.
          </p>
        </div>
      )}

      {questions.map((q, i) => (
        <div
          key={q.id}
          style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}
        >
          <span style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 600, minWidth: '20px', paddingTop: '2px' }}>
            {i + 1}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.9375rem', color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {q.body}
            </p>
            {q.type === 'mcq' && q.options && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {q.options.map((opt, oi) => (
                  <span
                    key={oi}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: opt.correct ? '#DCFCE7' : '#F1F5F9',
                      color: opt.correct ? '#166534' : '#475569',
                    }}
                  >
                    {opt.text || `Option ${oi + 1}`}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, ...TYPE_STYLE[q.type] }}>
              {TYPE_LABELS[q.type]}
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
              {q.points} {q.points === 1 ? 'pt' : 'pts'}
            </span>
          </div>
        </div>
      ))}

      {/* Add question form */}
      {showForm && (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', marginTop: '1rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600, color: '#1a1a2e' }}>
            New Question
          </h3>

          {qError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: '0.875rem' }}>
              {qError}
            </div>
          )}

          <form onSubmit={handleAddQuestion}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Question type</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as typeof qType)}
                  style={inputStyle}
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="essay">Essay</option>
                  <option value="true_false">True / False</option>
                  <option value="file_upload">File Upload</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Points</label>
                <input
                  type="number"
                  value={qPoints}
                  onChange={(e) => setQPoints(Number(e.target.value))}
                  min={1}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Question body</label>
              <textarea
                value={qBody}
                onChange={(e) => setQBody(e.target.value)}
                rows={3}
                required
                placeholder="Enter the question text…"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* MCQ options */}
            {qType === 'mcq' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>
                  Answer options — select the correct answer
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {mcqOptions.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="radio"
                        name="correct"
                        checked={correctIdx === i}
                        onChange={() => setCorrectIdx(i)}
                        style={{ width: '16px', height: '16px', accentColor: '#0369A1', flexShrink: 0 }}
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...mcqOptions];
                          next[i] = e.target.value;
                          setMcqOptions(next);
                        }}
                        placeholder={`Option ${i + 1}`}
                        style={{ ...inputStyle }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={qLoading2}
                style={{ padding: '0.625rem 1.25rem', background: qLoading2 ? '#93C5FD' : '#0369A1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: qLoading2 ? 'not-allowed' : 'pointer' }}
              >
                {qLoading2 ? 'Saving…' : 'Save Question'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{ padding: '0.625rem 1.25rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
