import { Button, Card } from 'react-bootstrap'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import Crumbs from '../components/Crumbs.jsx'
import ExamAnswer from '../components/ExamAnswer.jsx'
import PaperQuestion from '../components/PaperQuestion.jsx'
import { ITEMS } from '../data/content'
import { examMatches, examQuestion } from '../data/bmc/examMatches'
import { examPractice } from '../data/bmc/examPractice'
import { useProgress } from '../hooks/useProgress'

// The 2026 exam, prepared from the past exams: the exercise tasks that the 2025 exam, the 2024 exam and the 2024 re-exam were built from,
// grouped by the exam question they became. Each task is the exercise itself (same id, so the progress is shared with Exercises),
// with the teacher's answer page under Show answer. Each group has what to write in the exam (the short answer that gets the points).
// ?mode=practice shows the exam practice instead: the same questions with other values, answered the way to write them in the exam.
function Exam2026() {
  const { subjectId, week } = useParams()
  const { record } = useProgress()
  const [params, setParams] = useSearchParams()
  if (subjectId !== 'bmc') return <Navigate to={`/s/${subjectId}`} replace />

  const shown = new Set()
  const sections = examMatches.filter((m) => m.tasks.length).map((m) => {
    const tasks = m.tasks.filter(([id]) => !shown.has(id)).map(([id]) => ITEMS.find((i) => i.id === id))
    const earlier = m.tasks.filter(([id]) => shown.has(id)).map(([, label]) => label)
    tasks.forEach((t) => shown.add(t.id))
    return { ...m, items: tasks, earlier, practice: examPractice.filter((p) => p.group === m.topic) }
  })
  const practice = params.get('mode') === 'practice'

  return (
    <>
      <Crumbs subjectId={subjectId} week={week} current="2026 exam" />
      <h1 className="h3">2026 exam</h1>
      <p className="text-body-secondary">The lecturer said that three of the exam questions come from the exercises. In the 2025 exam, the 2024 exam and the 2024 re-exam they were always these tasks. Solve each one on paper, then compare with the teacher's answer. The teacher's answers explain a lot; "What to write in the exam" shows the short version that gets the points. This is what the past exams point to, not the real 2026 paper.</p>
      <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label="Show">
        <Button variant={practice ? 'secondary' : 'primary'} aria-pressed={!practice} onClick={() => setParams({})}>Exercise tasks</Button>
        <Button variant={practice ? 'primary' : 'secondary'} aria-pressed={practice} onClick={() => setParams({ mode: 'practice' })}>Exam practice: other values ({examPractice.length})</Button>
      </div>
      {practice && <p>The same exam questions with other values: other weights, another number of states, other grammars, other problems. Solve them on paper like in the exam; the answers are written the way to write them in the exam.</p>}

      {sections.map((m, n) => (
        <section key={m.topic} className="mb-4" aria-label={m.topic}>
          <h2 className="h5 mb-1">{n + 1}. {m.topic} <small className="text-body-secondary">({m.tasks.map(([, label]) => label).join(' + ')})</small></h2>
          <p className="small mb-3">
            <strong>Came in:</strong>{' '}
            {m.exams.map((id, i) => <span key={id}>{i > 0 && ', '}<Link to={`/s/${subjectId}/all/past-exams?exam=${examQuestion(id).exam}`}>{examQuestion(id).label}</Link></span>)}
            {' '}({m.match.toLowerCase()}). {m.how}
            {!practice && m.earlier.length > 0 && ` ${m.earlier.join(', ')} is above.`}
          </p>
          {!practice && <ExamAnswer write={m.write} />}
          {(practice ? m.practice : m.items).map((item) => (
            <Card body key={item.id} className="mb-3" as="article" aria-label={item.title}>
              <p className="text-body-secondary small mb-2">{practice ? 'Exam practice' : item.exercise}</p>
              <PaperQuestion item={item} onScore={(correct) => record(item.id, correct)} />
            </Card>
          ))}
        </section>
      ))}
    </>
  )
}

export default Exam2026
