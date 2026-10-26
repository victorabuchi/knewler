import { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import Crumbs from '../components/Crumbs.jsx'
import PaperQuestion from '../components/PaperQuestion.jsx'
import { ITEMS } from '../data/content'

function BmcExam() {
  const subjectId = 'bmc'
  const week = 'all'
  const label = 'All weeks'
  const items = ITEMS.filter((item) => item.subject === subjectId)
  const exams = [...new Set(items.filter((item) => item.examSet).map((item) => item.examSet))]
  const [selected, setSelected] = useState(exams[0])
  const questions = items.filter((item) => item.examSet === selected).sort((a, b) => a.examNo - b.examNo)
  return (
    <>
      <Crumbs subjectId={subjectId} week={week} current="Past questions" />
      <h1 className="h3">Past questions <small className="text-body-secondary fs-6">{label}</small></h1>
      <p className="text-body-secondary">English translations of the photographed Basic Models of Computation exams, with worked answers. Solve each question on paper before showing the answer.</p>
      <div className="d-flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Exam versions">
        {exams.map((exam) => <Button key={exam} variant={exam === selected ? 'primary' : 'outline-secondary'} role="tab" aria-selected={exam === selected} onClick={() => setSelected(exam)}>{exam}</Button>)}
      </div>
      {questions.map((item) => <Card body className="mb-4" key={item.id}><PaperQuestion key={item.id} item={item} onScore={() => {}} /></Card>)}
    </>
  )
}
export default BmcExam
