import { Button, Card } from 'react-bootstrap'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import Crumbs from '../components/Crumbs.jsx'
import ExamAnswer from '../components/ExamAnswer.jsx'
import PaperQuestion from '../components/PaperQuestion.jsx'
import { ITEMS } from '../data/content'
import { examMatches, examQuestion } from '../data/bmc/examMatches'
import { examPractice } from '../data/bmc/examPractice'
import { pastExamItems } from '../data/bmc/pastExams'
import { useProgress } from '../hooks/useProgress'

// The 2026 exam: the exercise tasks the exams were built from, grouped by the exam question they became. First the questions of the
// 2026 exam (30.10.2026), then the ones of the earlier exams. Each task shows only the lecturer's answer (the teacher's pages), and each
// group has what to write in the exam. A match with `showQuestion` shows the exam question itself, because its exercise is only similar.
// Each task is the exercise itself (same id, so the progress is shared with Exercises).
// ?mode=practice shows the exam practice instead: the same questions with other values, answered as what to write in the exam.
function Exam2026() {
  const { subjectId, week } = useParams()
  const { record } = useProgress()
  const [params, setParams] = useSearchParams()
  if (subjectId !== 'bmc') return <Navigate to={`/s/${subjectId}`} replace />

  const shown = new Set()
  const sections = examMatches.filter((m) => m.tasks.length).map((m, n) => {
    const tasks = m.showQuestion ? [] : m.tasks.filter(([id]) => !shown.has(id)).map(([id]) => ITEMS.find((i) => i.id === id))
    const earlier = m.showQuestion ? [] : m.tasks.filter(([id]) => shown.has(id)).map(([, label]) => label)
    tasks.forEach((t) => shown.add(t.id))
    const items = m.showQuestion ? m.exams.map((id) => pastExamItems.find((q) => q.id === id)) : tasks
    const in2026 = m.exams.some((id) => examQuestion(id).exam === 'final-2026')
    return { ...m, n: n + 1, in2026, items, earlier, practice: examPractice.filter((p) => p.group === m.topic) }
  })
  const parts = [
    ['From the 2026 exam (30.10.2026)', sections.filter((s) => s.in2026)],
    ['From the earlier exams (2025, 2024 and the 2024 re-exam)', sections.filter((s) => !s.in2026)],
  ]
  const practice = params.get('mode') === 'practice'

  return (
    <>
      <Crumbs subjectId={subjectId} week={week} current="2026 exam" />
      <h1 className="h3">2026 exam</h1>
      <p className="text-body-secondary">The exercise tasks the exams were built from: first the four questions of the 2026 exam, then the ones of the earlier exams (the 2024 re-exam repeated two questions of the 2024 exam). Solve each one on paper, then compare with the lecturer's answer and read what to write in the exam. All the questions of the 2026 exam are also on <Link to={`/s/${subjectId}/all/past-exams?exam=final-2026`}>Past exams</Link>.</p>
      <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label="Show">
        <Button variant={practice ? 'secondary' : 'primary'} aria-pressed={!practice} onClick={() => setParams({})}>Exercise tasks</Button>
        <Button variant={practice ? 'primary' : 'secondary'} aria-pressed={practice} onClick={() => setParams({ mode: 'practice' })}>Exam practice: other values ({examPractice.length})</Button>
      </div>
      {practice && <p>The same exam questions with other values: other numbers, other letters, other grammars, other problems. Solve them on paper like in the exam, then compare with what to write in the exam.</p>}

      {parts.map(([heading, list]) => (
        <section key={heading} className="mb-2" aria-label={heading}>
          <h2 className="h4 mb-3 border-bottom pb-1">{heading}</h2>
          {list.map((m) => (
            <section key={m.topic} className="mb-4" aria-label={m.topic}>
              <h3 className="h5 mb-1">{m.n}. {m.topic} <small className="text-body-secondary">({m.showQuestion && 'like '}{m.tasks.map(([, label]) => label).join(' + ')})</small></h3>
              <p className="small mb-3">
                <strong>Came in:</strong>{' '}
                {m.exams.map((id, i) => <span key={id}>{i > 0 && ', '}<Link to={`/s/${subjectId}/all/past-exams?exam=${examQuestion(id).exam}`}>{examQuestion(id).label}</Link></span>)}
                {' '}({m.match.toLowerCase()}). {m.how}
                {!practice && m.earlier.length > 0 && ` ${m.earlier.join(', ')} is above.`}
              </p>
              {(practice ? m.practice : m.items).map((item) => (
                <Card body key={item.id} className="mb-3" as="article" aria-label={item.title}>
                  <p className="text-body-secondary small mb-2">{practice ? 'Exam practice' : item.exercise}</p>
                  <PaperQuestion item={item} level={4} show={practice ? 'write' : 'teacher'} onScore={(correct) => record(item.id, correct)} />
                </Card>
              ))}
              {!practice && <ExamAnswer write={m.write} />}
            </section>
          ))}
        </section>
      ))}
    </>
  )
}

export default Exam2026
