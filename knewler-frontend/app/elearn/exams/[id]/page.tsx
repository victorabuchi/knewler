'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'essay' | 'file_upload';
  body: string;
  options: Array<{ text: string; correct?: boolean }> | null;
  points: number;
  position: number;
}

interface ExamData {
  id: string;
  title: string;
  duration_mins: number;
  pass_score: number;
  shuffle: boolean;
  tab_lock: boolean;
  course_title: string;
}

interface Attempt {
  id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  passed: boolean | null;
}

interface QuestionResult {
  question_id: string;
  is_correct: boolean | null;
  correct_option: number | null;
  answer_given: string | number | null;
  points_earned: number;
}

type Phase = 'loading' | 'confirm' | 'active' | 'submitting' | 'results';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Confirm screen ───────────────────────────────────────────────────────────
function ConfirmScreen({
  exam,
  questionCount,
  onStart,
}: {
  exam: ExamData;
  questionCount: number;
  onStart: () => void;
}) {
  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>
      <Link href="/elearn/exams" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '2rem' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Exams
      </Link>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.375rem' }}>{exam.title}</h1>
      <p style={{ margin: '0 0 2rem', fontSize: '0.9375rem', color: '#64748B' }}>{exam.course_title}</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Duration', value: `${exam.duration_mins} min` },
          { label: 'Questions', value: `${questionCount}` },
          { label: 'Pass Score', value: `${exam.pass_score}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1a1a2e' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Anti-cheat warning */}
      {exam.tab_lock && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#92400E' }}>Anti-cheat monitoring enabled</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#B45309' }}>
              Switching tabs or windows during this exam will be recorded and may result in disqualification.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onStart}
        style={{
          width: '100%',
          padding: '0.875rem',
          background: '#0369A1',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Start Exam
      </button>
    </div>
  );
}

// ─── Question input ───────────────────────────────────────────────────────────
function QuestionInput({
  question,
  answer,
  onChange,
  disabled,
}: {
  question: Question;
  answer: string | number | undefined;
  onChange: (val: string | number) => void;
  disabled: boolean;
}) {
  if (question.type === 'mcq') {
    const opts = question.options ?? [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {opts.map((opt, idx) => (
          <label
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              border: `2px solid ${answer === idx ? '#0369A1' : '#E2E8F0'}`,
              borderRadius: '8px',
              background: answer === idx ? '#EFF6FF' : '#ffffff',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              checked={answer === idx}
              onChange={() => !disabled && onChange(idx)}
              style={{ marginTop: '2px', flexShrink: 0, accentColor: '#0369A1' }}
              disabled={disabled}
            />
            <span style={{ fontSize: '0.9375rem', color: '#1a1a2e', lineHeight: 1.5 }}>{opt.text}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'true_false') {
    return (
      <div style={{ display: 'flex', gap: '1rem' }}>
        {['True', 'False'].map((label, idx) => (
          <label
            key={idx}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem',
              border: `2px solid ${answer === idx ? '#0369A1' : '#E2E8F0'}`,
              borderRadius: '8px',
              background: answer === idx ? '#EFF6FF' : '#ffffff',
              cursor: disabled ? 'default' : 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: '#1a1a2e',
            }}
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              checked={answer === idx}
              onChange={() => !disabled && onChange(idx)}
              style={{ accentColor: '#0369A1' }}
              disabled={disabled}
            />
            {label}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'essay') {
    return (
      <textarea
        value={(answer as string) ?? ''}
        onChange={(e) => !disabled && onChange(e.target.value)}
        disabled={disabled}
        placeholder="Write your answer here…"
        rows={8}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          fontSize: '0.9375rem',
          color: '#1a1a2e',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
    );
  }

  // file_upload
  return (
    <div style={{ border: '2px dashed #E2E8F0', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.9375rem', color: '#64748B' }}>Upload your file</p>
      <input
        type="file"
        disabled={disabled}
        onChange={(e) => !disabled && e.target.files?.[0] && onChange(e.target.files[0].name)}
        style={{ fontSize: '0.875rem' }}
      />
    </div>
  );
}

// ─── Results review question ──────────────────────────────────────────────────
function ResultQuestion({
  question,
  result,
  answerGiven,
}: {
  question: Question;
  result: QuestionResult;
  answerGiven: string | number | null | undefined;
}) {
  const isAutoGraded = question.type === 'mcq' || question.type === 'true_false';

  return (
    <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.875rem' }}>
        <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#1a1a2e', lineHeight: 1.5, flex: 1 }}>{question.body}</p>
        {isAutoGraded ? (
          <span
            style={{
              flexShrink: 0,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: result.is_correct ? '#DCFCE7' : '#FEE2E2',
              color: result.is_correct ? '#166534' : '#991B1B',
            }}
          >
            {result.is_correct ? `+${question.points} pts` : '0 pts'}
          </span>
        ) : (
          <span style={{ flexShrink: 0, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#F1F5F9', color: '#64748B' }}>
            Pending
          </span>
        )}
      </div>

      {isAutoGraded && question.options && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {question.options.map((opt, idx) => {
            const isCorrect = idx === result.correct_option;
            const isChosen = idx === Number(answerGiven);
            let bg = 'transparent';
            let border = '#E2E8F0';
            let color = '#374151';
            if (isCorrect) { bg = '#F0FDF4'; border = '#86EFAC'; color = '#166534'; }
            else if (isChosen && !isCorrect) { bg = '#FEF2F2'; border = '#FECACA'; color = '#DC2626'; }

            return (
              <div
                key={idx}
                style={{
                  padding: '0.625rem 0.875rem',
                  borderRadius: '6px',
                  border: `1px solid ${border}`,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  fontSize: '0.875rem',
                  color,
                  fontWeight: isCorrect || (isChosen && !isCorrect) ? 600 : 400,
                }}
              >
                {isCorrect && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {isChosen && !isCorrect && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
                {!isCorrect && !isChosen && <span style={{ width: '14px', display: 'inline-block' }} />}
                {opt.text}
              </div>
            );
          })}
        </div>
      )}

      {question.type === 'essay' && answerGiven && (
        <div style={{ background: '#F8FAFC', borderRadius: '6px', padding: '0.75rem', fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>
          {String(answerGiven)}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ExamTakingPage() {
  const params = useParams();
  const examId = params.id as string;

  const [phase, setPhase] = useState<Phase>('loading');
  const [exam, setExam] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<{ score: number; passed: boolean; results: QuestionResult[] } | null>(null);
  // Pre-loaded answers and results if already submitted
  const [savedAnswers, setSavedAnswers] = useState<Record<string, { answer_option?: number; answer_text?: string; is_correct?: boolean }>>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabSwitchesRef = useRef(0);

  // Load exam
  useEffect(() => {
    api
      .get(`/api/elearn/exams/${examId}`)
      .then((r) => {
        const { exam: e, questions: qs, attempt: a, answers: savedA } = r.data;
        setExam(e);
        setQuestions(qs);
        setAttempt(a);

        if (a.submitted_at) {
          // Already done — go straight to results view
          setSavedAnswers(savedA ?? {});
          // Reconstruct result from attempt
          const reconstructed = qs.map((q: Question) => {
            const saved = savedA?.[q.id];
            return {
              question_id: q.id,
              is_correct: saved?.is_correct ?? null,
              correct_option: q.options ? q.options.findIndex((o) => o.correct === true) : null,
              answer_given: saved?.answer_option ?? saved?.answer_text ?? null,
              points_earned: saved?.is_correct ? q.points : 0,
            };
          });
          setResult({ score: a.score ?? 0, passed: a.passed ?? false, results: reconstructed });
          setPhase('results');
        } else {
          setPhase('confirm');
        }
      })
      .catch(() => setPhase('confirm')); // fallback, will show error from empty state
  }, [examId]);

  // Timer
  function startTimer() {
    if (!exam) return;
    const totalSeconds = exam.duration_mins * 60;
    setTimeLeft(totalSeconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Tab lock
  useEffect(() => {
    if (!exam?.tab_lock || phase !== 'active') return;
    function handleVisibility() {
      if (document.hidden) {
        tabSwitchesRef.current += 1;
        setTabWarning(true);
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [exam?.tab_lock, phase]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function handleStart() {
    setPhase('active');
    startTimer();
  }

  async function handleSubmit() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('submitting');
    setSubmitError('');
    try {
      const res = await api.post(`/api/elearn/exams/${examId}/submit`, {
        answers,
        tab_switches: tabSwitchesRef.current,
      });
      setResult(res.data);
      setPhase('results');
    } catch {
      setSubmitError('Submission failed. Please try again.');
      setPhase('active');
      startTimer();
    }
  }

  // ── Loading ──
  if (phase === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <span style={{ color: '#0369A1', fontSize: '1rem', fontWeight: 500 }}>Loading exam…</span>
      </div>
    );
  }

  // ── Confirm ──
  if (phase === 'confirm' && exam) {
    return <ConfirmScreen exam={exam} questionCount={questions.length} onStart={handleStart} />;
  }

  // ── Results ──
  if (phase === 'results' && result && exam) {
    const autoGraded = questions.filter(q => q.type === 'mcq' || q.type === 'true_false');
    const correct = result.results.filter(r => r.is_correct === true).length;

    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Score header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: `6px solid ${result.passed ? '#22C55E' : '#EF4444'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: result.passed ? '#16A34A' : '#DC2626' }}>
              {result.score}%
            </span>
          </div>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' }}>{exam.title}</h1>
          <span
            style={{
              display: 'inline-block',
              padding: '0.3rem 0.9rem',
              borderRadius: '999px',
              fontSize: '0.9375rem',
              fontWeight: 700,
              background: result.passed ? '#DCFCE7' : '#FEE2E2',
              color: result.passed ? '#166534' : '#991B1B',
            }}
          >
            {result.passed ? 'Passed' : 'Failed'}
          </span>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Score', value: `${result.score}%` },
            { label: 'Correct', value: `${correct} / ${autoGraded.length}` },
            { label: 'Pass Mark', value: `${exam.pass_score}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1a2e' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Question review */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a2e', margin: '0 0 1rem' }}>Question Review</h2>
        {questions.map((q, idx) => {
          const r = result.results.find((x) => x.question_id === q.id);
          const savedA = savedAnswers[q.id];
          const answerGiven = r?.answer_given ?? savedA?.answer_option ?? savedA?.answer_text ?? null;
          if (!r) return null;
          return <ResultQuestion key={q.id} question={q} result={r} answerGiven={answerGiven} />;
        })}

        <Link
          href="/elearn/exams"
          style={{ display: 'inline-block', marginTop: '1rem', padding: '0.625rem 1.25rem', background: '#F1F5F9', color: '#0369A1', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
        >
          ← Back to Exams
        </Link>
      </div>
    );
  }

  // ── Active exam ──
  if ((phase === 'active' || phase === 'submitting') && exam && questions.length > 0) {
    const q = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const isRed = timeLeft > 0 && timeLeft <= 300;
    const answeredCount = Object.keys(answers).length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 60px)' }}>
        {/* Exam top bar */}
        <div
          style={{
            position: 'sticky',
            top: '60px',
            zIndex: 50,
            background: '#ffffff',
            borderBottom: '1px solid #E2E8F0',
            padding: '0 24px',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {exam.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
              {answeredCount}/{questions.length} answered
            </span>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: isRed ? '#DC2626' : '#1a1a2e',
                background: isRed ? '#FEF2F2' : '#F1F5F9',
                padding: '4px 12px',
                borderRadius: '6px',
                minWidth: '72px',
                textAlign: 'center',
              }}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Tab switch warning */}
        {tabWarning && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: 500 }}>
              ⚠ Tab switch detected ({tabSwitchesRef.current}). This has been recorded.
            </span>
            <button
              onClick={() => setTabWarning(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', fontSize: '1rem', padding: '0 4px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Submit error */}
        {submitError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: '#DC2626' }}>
            {submitError}
          </div>
        )}

        {/* Question area */}
        <div style={{ flex: 1, maxWidth: '720px', margin: '0 auto', width: '100%', padding: '32px 24px' }}>
          {/* Counter */}
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
            Question {currentIdx + 1} of {questions.length}
            <span style={{ marginLeft: '0.5rem', color: '#94A3B8' }}>· {q.points} {q.points === 1 ? 'pt' : 'pts'}</span>
          </p>

          {/* Question progress dots */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${idx === currentIdx ? '#0369A1' : answers[questions[idx].id] !== undefined ? '#0369A1' : '#E2E8F0'}`,
                  background: idx === currentIdx ? '#0369A1' : answers[questions[idx].id] !== undefined ? '#EFF6FF' : '#ffffff',
                  color: idx === currentIdx ? '#ffffff' : '#374151',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Question body */}
          <p style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 500, color: '#1a1a2e', lineHeight: 1.6 }}>
            {q.body}
          </p>

          {/* Answer input */}
          <QuestionInput
            question={q}
            answer={answers[q.id]}
            onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
            disabled={phase === 'submitting'}
          />
        </div>

        {/* Bottom nav */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#ffffff',
            borderTop: '1px solid #E2E8F0',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0 || phase === 'submitting'}
            style={{
              padding: '0.5rem 1rem',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              color: currentIdx === 0 ? '#CBD5E1' : '#374151',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
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

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={phase === 'submitting'}
              style={{
                padding: '0.5rem 1.5rem',
                background: phase === 'submitting' ? '#93C5FD' : '#059669',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: phase === 'submitting' ? 'not-allowed' : 'pointer',
              }}
            >
              {phase === 'submitting' ? 'Submitting…' : `Submit Exam (${answeredCount}/${questions.length})`}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              disabled={phase === 'submitting'}
              style={{
                padding: '0.5rem 1rem',
                background: '#0369A1',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: '#DC2626', fontSize: '0.9375rem' }}>Failed to load exam.</p>
      <Link href="/elearn/exams" style={{ color: '#0369A1', fontSize: '0.875rem', textDecoration: 'none' }}>← Back to Exams</Link>
    </div>
  );
}
