import { useState } from 'react'
import { Button, Card, Table } from 'react-bootstrap'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import Crumbs from '../components/Crumbs.jsx'
import PaperQuestion from '../components/PaperQuestion.jsx'
import { ITEMS } from '../data/content'
import { examMatches, examQuestion, matchOfQuestion } from '../data/bmc/examMatches'
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
// On top: which exercise tasks the exam questions come from.
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

      <Card body className="mb-4">
        <h2 className="h5">Which exercises the exams come from</h2>
        <p className="mb-2">The lecturer said that three of the exam questions come from the exercises. In all three past exams they were the same tasks: <strong>X3 T4 + T5</strong> (the hexagon automaton), <strong>X5 T2</strong> (which grammar is not regular) and <strong>X6 T1</strong> (in P? in NP?). Make sure you can solve these without help. This is the pattern of the past exams, not a promise about this one.</p>
        <Table responsive size="sm" className="small mb-0">
          <thead><tr><th scope="col">Exercise task</th><th scope="col">Past exam question</th><th scope="col">How close</th></tr></thead>
          <tbody>
            {examMatches.map((m) => (
              <tr key={m.topic}>
                <td>{m.tasks.length ? taskLinks(m.tasks) : '—'}<div className="text-body-secondary">{m.topic}</div></td>
                <td>{m.exams.map((id) => <div key={id}><Button variant="link" size="sm" className="p-0 align-baseline text-nowrap text-start" onClick={() => pick(examQuestion(id).exam)}>{examQuestion(id).label}</Button></div>)}</td>
                <td><strong>{m.match}.</strong> {m.how}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Exams">
        {pastExams.map((e) => (
          <Button key={e.id} variant={e === exam ? 'primary' : 'secondary'} aria-pressed={e === exam} onClick={() => pick(e.id)}>{e.title}</Button>
        ))}
      </div>

      <Card body className="mb-4">
        <h2 className="h5 mb-1">{exam.title} <small className="text-body-secondary">({exam.finnishTitle}, {exam.points} points)</small></h2>
        {exam.instructions && <p className="mb-2">{exam.instructions}</p>}
        {exam.note && <p className="small mb-2"><strong>Note:</strong> {exam.note}</p>}
        <p className="small text-body-secondary mb-2">{exam.questions.length} questions: {exam.questions.map((q) => `${q.no}) ${q.points} p`).join(' · ')}</p>
        <Button size="sm" variant={paper ? 'secondary' : 'dark'} onClick={() => setPaper(!paper)} aria-expanded={paper}>{paper ? 'Hide the original exam paper' : 'Show the original exam paper'}</Button>
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
          </Card>
        )
      })}
    </>
  )
}

export default PastExams
