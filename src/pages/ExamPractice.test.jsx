import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { questions } from '../data/webprog/examPractice'
import { renderApp } from '../test/helpers.jsx'

const nav = () => within(screen.getByRole('navigation', { name: 'Main' }))
const optionButtons = () => within(screen.getByRole('group', { name: 'Answer options' })).getAllByRole('button')

describe('Exam practice', () => {
  it('is in the top bar of Web Programming I only', () => {
    const { unmount } = renderApp('/s/webprog')
    expect(nav().getByRole('link', { name: 'Exam practice' })).toBeInTheDocument()
    unmount()
    renderApp('/s/bmc')
    expect(nav().queryByRole('link', { name: 'Exam practice' })).not.toBeInTheDocument()
  })

  it('has all 26 Moodle questions, numbered 1, 2, 3 ... without gaps', () => {
    expect(questions).toHaveLength(26)
    expect(questions.map((q) => q.examNo)).toEqual(questions.map((_, i) => i + 1))
  })

  it('asks every question in the Moodle order, with no feedback until the end', async () => {
    const user = userEvent.setup()
    renderApp('/s/webprog/all/exam')
    expect(screen.getByRole('heading', { name: 'Exam practice' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Attempt quiz' }))

    for (const [n, q] of questions.entries()) {
      expect(screen.getByText(`Question ${n + 1} of ${questions.length}`, { exact: false })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(q.q)
      if (q.kind === 'mcq') {
        expect(optionButtons().map((b) => b.textContent).sort()).toEqual([...q.options].sort())
        await user.click(screen.getByRole('button', { name: q.options[0] })) // the right answer
      } else {
        await user.type(screen.getByRole('textbox'), 'my explanation')
      }
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /^(Next question|Finish exam)$/ }))
    }
    expect(screen.getByRole('heading', { name: 'Exam practice results' })).toBeInTheDocument()
    const mcqs = questions.filter((q) => q.kind === 'mcq').length
    expect(screen.getByRole('status')).toHaveTextContent(`Multiple choice: ${mcqs} of ${mcqs} correct.`)
    // the multiple-choice answers are in progress without pressing Save
    const saved = JSON.parse(localStorage.getItem('scribletics_progress'))
    expect(Object.keys(saved)).toHaveLength(mcqs)
    expect(Object.values(saved).every((p) => p.box === 1)).toBe(true)
  })

  it('shows the code of the explain-the-code questions and a model answer to compare with at the end', async () => {
    const user = userEvent.setup()
    renderApp('/s/webprog/all/exam')
    await user.click(screen.getByRole('button', { name: 'Attempt quiz' }))
    for (const q of questions) {
      if (q.kind === 'explain') {
        expect(screen.getByText(q.code.split('\n')[0], { exact: false })).toBeInTheDocument()
        await user.type(screen.getByRole('textbox'), 'my explanation')
      } else await user.click(optionButtons()[0])
      await user.click(screen.getByRole('button', { name: /^(Next question|Finish exam)$/ }))
    }
    expect(screen.getByText(/Open questions are not graded here/)).toBeInTheDocument()
    expect(screen.getByText(/implicit return/)).toBeInTheDocument() // question 10
    expect(screen.getAllByText(/reloads \(or navigates\) the page/).length).toBeGreaterThan(0) // question 14
    expect(screen.getAllByText(/renders two different cards/).length).toBeGreaterThan(0) // question 16
  })

  it('has no accessibility violations', async () => {
    const { container } = renderApp('/s/webprog/all/exam')
    await screen.findByRole('button', { name: 'Attempt quiz' })
    expect(await axe(container)).toHaveNoViolations()
  })
})
