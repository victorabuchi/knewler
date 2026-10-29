import { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { Navigate, useParams } from 'react-router-dom'
import Crumbs from '../components/Crumbs.jsx'
import PaperQuestion from '../components/PaperQuestion.jsx'
import { pastExams } from '../data/bmc/pastExams'
import { useProgress } from '../hooks/useProgress'

const base = import.meta.env.BASE_URL ?? './'

// Past exams of a course, translated into English and solved in the teacher's style. Like a paper exam: all questions on one page,
// each with Show answer (and the Finnish original). The original exam paper can be shown as photos.
function PastExams() {
  const { subjectId, week } = useParams()
  const { record } = useProgress()
  const [picked, setPicked] = useState(0)
  const [paper, setPaper] = useState(false)
  if (subjectId !== 'bmc') return <Navigate to={`/s/${subjectId}`} replace />

  const exam = pastExams[Math.min(picked, pastExams.length - 1)]
  return (
    <>
      <Crumbs subjectId={subjectId} week={week} current="Past exams" />
      <h1 className="h3">Past exams</h1>
      <p className="text-body-secondary">Old exams of the course, translated from Finnish and solved step by step, the same way the teacher solves the exercises. Solve each question on paper first, then show the answer.</p>
      <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Exams">
        {pastExams.map((e, i) => (
          <Button key={e.id} variant={i === picked ? 'primary' : 'secondary'} aria-pressed={i === picked} onClick={() => { setPicked(i); setPaper(false) }}>{e.title}</Button>
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

      {exam.questions.map((q) => (
        <Card body key={q.id} className="mb-4" as="article" aria-label={q.title}>
          <PaperQuestion item={{ ...q, kind: 'paper', subject: 'bmc' }} onScore={(correct) => record(q.id, correct)} />
        </Card>
      ))}
    </>
  )
}

export default PastExams
