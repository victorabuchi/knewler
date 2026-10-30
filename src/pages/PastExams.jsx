import { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import Crumbs from '../components/Crumbs.jsx'
import ExamAnswer from '../components/ExamAnswer.jsx'
import PaperQuestion from '../components/PaperQuestion.jsx'
import { ITEMS } from '../data/content'
import { matchOfQuestion } from '../data/bmc/examMatches'
import { pastExams } from '../data/bmc/pastExams'
import { useProgress } from '../hooks/useProgress'

const base = import.meta.env.BASE_URL ?? './'

// The Exercises page address of an exercise task: its sheet and its number in the sheet.
function taskLink(subjectId, id) {
  const item = ITEMS.find((i) => i.id === id)
  const n = ITEMS.filter((i) => i.subject === subjectId && i.exercise === item.exercise).indexOf(item) + 1
  return `/s/${subjectId}/all/exercises?${new URLSearchParams({ exercise: item.exercise, task: n })}`
}

// Past exams of a course, translated into English and solved in the teacher's style. Like a paper exam: all questions on one page,
// each with Show answer (and the Finnish original). The original exam paper can be shown as photos. ?exam=final-2024 picks the exam.
// Each question says which exercise tasks it comes from (the 2026 re-exam page has them all).
function PastExams() {
  const { subjectId, week } = useParams()
  const { record } = useProgress()
  const [params, setParams] = useSearchParams()
  const [paper, setPaper] = useState(false)
  if (subjectId !== 'bmc') return <Navigate to={`/s/${subjectId}`} replace />

  const exam = pastExams.find((e) => e.id === params.get('exam')) ?? pastExams[0]
  const pick = (id) => { setParams({ exam: id }); setPaper(false) }
  const taskLinks = (tasks) => tasks.map(([id, label], i) => <span key={id}>{i > 0 && ', '}<Link to={taskLink(subjectId, id)}>{label}</Link></span>)
  return (
    <>
      <Crumbs subjectId={subjectId} week={week} current="Past exams" />
      <h1 className="h3">Past exams</h1>
      <p className="text-body-secondary">Old exams of the course, translated from Finnish and solved step by step, the same way the teacher solves the exercises. Solve each question on paper first, then show the answer.</p>

      <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Exams">
        {pastExams.map((e) => (
          <Button key={e.id} variant={e === exam ? 'primary' : 'secondary'} aria-pressed={e === exam} onClick={() => pick(e.id)}>{e.title}</Button>
        ))}
      </div>

      <Card body className="mb-4">
        <h2 className="h5 mb-1">{exam.title} <small className="text-body-secondary">({exam.fromMemory ? 'written down from memory' : `${exam.finnishTitle}, ${exam.points} points`})</small></h2>
        {exam.instructions && <p className="mb-2">{exam.instructions}</p>}
        {exam.note && <p className="small mb-2"><strong>Note:</strong> {exam.note}</p>}
        <p className="small text-body-secondary mb-2">{exam.questions.length} questions{exam.points ? `: ${exam.questions.map((q) => `${q.no}) ${q.points} p`).join(' · ')}` : ''}</p>
        {exam.images.length > 0 && <Button size="sm" variant={paper ? 'secondary' : 'dark'} onClick={() => setPaper(!paper)} aria-expanded={paper}>{paper ? 'Hide the original exam paper' : 'Show the original exam paper'}</Button>}
        {paper && exam.images.map((img, i) => (
          <img key={img} src={`${base}docs/past/${img}`} alt={`${exam.finnishTitle}, page ${i + 1} (in Finnish)`} className="answer-page mt-3" loading="lazy" />
        ))}
      </Card>

      {exam.questions.map((q) => {
        const m = matchOfQuestion(q.id)
        return (
          <Card body key={q.id} className="mb-4" as="article" aria-label={q.title}>
            {m?.tasks.length > 0 && <p className="small mb-2"><strong>From the exercises:</strong> {taskLinks(m.tasks)} ({m.match.toLowerCase()})</p>}
            <PaperQuestion item={{ ...q, kind: 'paper', subject: 'bmc' }} onScore={(correct) => record(q.id, correct)} />
            {m?.write && <ExamAnswer write={m.write} />}
          </Card>
        )
      })}
    </>
  )
}

export default PastExams
