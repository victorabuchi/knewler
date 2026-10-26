import { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { Navigate } from 'react-router-dom'
import Crumbs from '../components/Crumbs.jsx'
import PaperQuestion from '../components/PaperQuestion.jsx'
import { useScope } from '../useScope'

function BmcExam() {
  const { subjectId, week, valid, items, label } = useScope()
  const exams = [...new Set(items.filter((item) => item.examSet).map((item) => item.examSet))]
  const [selected, setSelected] = useState(exams[0])
  if (!valid) return <Navigate to="/" replace />
  const questions = items.filter((item) => item.examSet === selected).sort((a, b) => a.examNo - b.examNo)
  return (
    <>
      <Crumbs subjectId={subjectId} week={week} current="Exam translations" />
      <h1 className="h3">Exam translations <small className="text-body-secondary fs-6">{label}</small></h1>
      <p className="text-body-secondary">English translations of the photographed Basic Models of Computation exams, with worked answers. Solve each question on paper before showing the answer.</p>
      <div className="d-flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Exam versions">
        {exams.map((exam) => <Button key={exam} variant={exam === selected ? 'primary' : 'outline-secondary'} role="tab" aria-selected={exam === selected} onClick={() => setSelected(exam)}>{exam}</Button>)}
      </div>
      {questions.map((item) => <Card body className="mb-4" key={item.id}><PaperQuestion key={item.id} item={item} onScore={() => {}} /></Card>)}
    </>
  )
}
export default BmcExam
