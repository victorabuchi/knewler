import { useState } from 'react'
import { Alert, Button } from 'react-bootstrap'

// "What to write in the exam": the short answer that gets the points, behind a button so you can try first.
// `write` is a list of paragraphs (strings) and { code } blocks, like a task's answer.
function ExamAnswer({ write }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-3">
      <Button size="sm" variant={open ? 'secondary' : 'success'} onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? 'Hide what to write' : 'What to write in the exam'}
      </Button>
      {open && (
        <Alert variant="light" className="border mt-2 mb-0" role="region" aria-label="What to write in the exam">
          <strong>What to write in the exam</strong>
          <p className="small text-body-secondary mb-2">The result, one reason and the key steps for each part. That is enough for the points; the grader only sees what you write.</p>
          {write.map((w, i) => (typeof w === 'string'
            ? <p key={i} className="mb-2">{w}</p>
            : <pre key={i} className="code wrap"><code>{w.code}</code></pre>))}
        </Alert>
      )}
    </div>
  )
}

export default ExamAnswer
