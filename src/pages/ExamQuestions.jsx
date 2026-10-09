import { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { Navigate } from 'react-router-dom'
import Crumbs from '../components/Crumbs.jsx'
import LearnMore from '../components/LearnMore.jsx'
import { TOPICS } from '../data/content'
import { useScope } from '../useScope'

// A fixed, repeatable shuffle (the data lists the correct option first, so showing it as written would give the answer away).
function stableOrder(options, seed) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const next = () => (h = (h * 1664525 + 1013904223) >>> 0) / 2 ** 32
  const out = [...options]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function Question({ item, revealed, onToggle }) {
  const options = item.kind === 'mcq' ? stableOrder(item.options, item.id) : []
  const correct = item.kind === 'mcq' ? item.options[0] : null
  return (
    <Row as="article" id={`q-${item.examNo}`} aria-labelledby={`q-title-${item.examNo}`} className="exam-question g-0 mb-4">
      <Col md={2} className="exam-info">
        <h2 id={`q-title-${item.examNo}`} className="h6 mb-1">Question <span className="fs-4 fw-bold">{item.examNo}</span></h2>
        <div className="small">{revealed ? 'Answer shown' : 'Not answered'}</div>
        <div className="small">Marked out of 1.00</div>
        <div className="small mt-2">Week {item.week}: {TOPICS[item.topic] ?? item.topic}</div>
      </Col>
      <Col md={10} className="exam-body">
        <p className="exam-text">{item.q}</p>
        {item.code && <pre className="code"><code>{item.code}</code></pre>}
        {item.kind === 'mcq' && (
          <>
            <p className="fw-semibold mb-1">Select one:</p>
            <ol type="a" className="exam-options">
              {options.map((o) => (
                <li key={o} className={revealed && o === correct ? 'correct' : undefined}>
                  {o}
                  {revealed && o === correct && <span className="ms-2 fw-semibold">(correct answer)</span>}
                </li>
              ))}
            </ol>
          </>
        )}
        <Button size="sm" variant={revealed ? 'secondary' : 'primary'} onClick={onToggle} aria-expanded={revealed}>
          {revealed ? 'Hide answer' : 'Show answer'}
        </Button>
        {revealed && item.kind === 'mcq' && item.why && <p className="exam-answer mt-3 mb-0"><strong>Why:</strong> {item.why}</p>}
        {revealed && <LearnMore item={item} />}
        {revealed && item.kind === 'explain' && (
          <div className="exam-answer mt-3">
            <p><strong>Model answer:</strong> {item.model}</p>
            <strong>Key points:</strong>
            <ul className="mb-0">{item.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
          </div>
        )}
      </Col>
    </Row>
  )
}

// Every Moodle "Exam practice" question on one page, in the Moodle order, like reading the quiz: question text, code and options.
// The answers stay hidden until you show them (one by one, or all at once).
function ExamQuestions() {
  const { subjectId, week, valid, items, label } = useScope()
  const [shown, setShown] = useState(() => new Set())
  if (!valid) return <Navigate to="/" replace />

  const list = items.filter((i) => i.examNo).sort((a, b) => a.examNo - b.examNo)
  const all = shown.size === list.length && list.length > 0
  const toggle = (n) => setShown((s) => {
    const next = new Set(s)
    if (next.has(n)) next.delete(n)
    else next.add(n)
    return next
  })
  const go = (n) => document.getElementById(`q-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <Crumbs subjectId={subjectId} week={week} current="All exam questions" />
      <h1 className="h3">All exam questions <small className="text-body-secondary fs-6">{label}</small></h1>
      <p className="text-body-secondary">The Moodle exam practice, all {list.length} questions in the Moodle order. Read them like the quiz, then show the answer. To be tested with feedback, use Exam practice.</p>
      {!list.length && <p className="text-body-secondary">No exam practice questions here.</p>}
      {list.length > 0 && (
        <>
          <nav aria-label="Question navigation" className="exam-nav mb-4">
            <div className="d-flex flex-wrap gap-2 mb-2">
              {list.map((q) => <Button key={q.id} size="sm" variant={shown.has(q.examNo) ? 'success' : 'secondary'} aria-label={`Question ${q.examNo}`} onClick={() => go(q.examNo)}>{q.examNo}</Button>)}
            </div>
            <Form.Check
              type="switch"
              id="show-all"
              label="Show all answers"
              checked={all}
              onChange={(e) => setShown(e.target.checked ? new Set(list.map((q) => q.examNo)) : new Set())}
            />
          </nav>
          {list.map((q) => <Question key={q.id} item={q} revealed={shown.has(q.examNo)} onToggle={() => toggle(q.examNo)} />)}
        </>
      )}
    </>
  )
}

export default ExamQuestions
