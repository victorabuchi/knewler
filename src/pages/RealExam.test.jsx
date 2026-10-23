import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { scopedItems } from '../data/content'
import { questions as exam } from '../data/webprog/realExam'
import { renderApp } from '../test/helpers.jsx'

describe('Web Programming I: the real exam of 23.10.2026', () => {
  it('has 25 questions numbered 1 to 25, each with an answer', () => {
    expect(exam.map((q) => q.realNo)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1))
    for (const q of exam) {
      if (q.kind === 'mcq') {
        expect(q.display, q.id).toHaveLength(4)
        expect(new Set(q.display), q.id).toEqual(new Set(q.options)) // the same options, Moodle order
        expect(q.why, q.id).toBeTruthy()
      } else {
        expect(q.model.length, q.id).toBeGreaterThan(200)
        expect(q.keyPoints.length, q.id).toBeGreaterThanOrEqual(3)
        expect(q.code, q.id).toBeTruthy()
      }
    }
    expect(exam.filter((q) => q.kind === 'explain').map((q) => q.realNo)).toEqual([5, 10, 15, 20, 25])
  })

  it('is in the top bar and lists all 25 questions with the options in the Moodle order', async () => {
    const user = userEvent.setup()
    renderApp('/s/webprog')
    await user.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Exam 23.10.2026' }))
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(exam.map((q) => `Question ${q.realNo}`))
    const q1 = document.getElementById('q-1')
    expect(within(q1).getAllByRole('listitem').map((li) => li.textContent)).toEqual(exam[0].display)
    await user.click(within(q1).getByRole('button', { name: 'Show answer' }))
    expect(within(q1).getByText('(correct answer)').parentElement).toHaveTextContent('Props are immutable and passed in from outside the component')
  })

  it('shows the code and the model answer of an open question', async () => {
    const user = userEvent.setup()
    renderApp('/s/webprog/all/real-questions')
    const q25 = document.getElementById('q-25')
    expect(within(q25).getByText(/onClick=\{clearNote\(\)\}/)).toBeInTheDocument()
    await user.click(within(q25).getByRole('button', { name: 'Show answer' }))
    expect(within(q25).getByText(/Model answer:/).parentElement).toHaveTextContent('Too many re-renders')
  })

  it('can be taken as a quiz, in the exam order, with no feedback until the end', async () => {
    const user = userEvent.setup()
    renderApp('/s/webprog/all/real-questions')
    await user.click(screen.getByRole('link', { name: 'Take it as a quiz' }))
    expect(screen.getByRole('heading', { name: 'Exam 23.10.2026' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Attempt quiz' }))
    for (const [n, q] of exam.entries()) {
      expect(screen.getByText(`Question ${n + 1} of 25`, { exact: false })).toBeInTheDocument()
      if (q.kind === 'mcq') await user.click(screen.getByRole('button', { name: q.options[0] }))
      else await user.type(screen.getByRole('textbox'), 'my answer')
      await user.click(screen.getByRole('button', { name: /^(Next question|Finish exam)$/ }))
    }
    expect(screen.getByRole('heading', { name: 'Exam 23.10.2026 results' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Multiple choice: 20 of 20 correct.')
  }, 60000)

  it('is the Practice of each week (and nothing else is)', () => {
    const inWeek = (n) => scopedItems('webprog', n).filter((i) => i.realNo).map((i) => i.realNo)
    expect(inWeek(2)).toEqual([12, 13, 14, 15, 16, 17]) // the Git questions
    renderApp('/s/webprog/2/practice')
    const total = inWeek(2).length
    expect(screen.getByText(new RegExp(`\\(${total} now\\)`))).toBeInTheDocument()
  })

  it('weeks without exam questions have no Practice tile', () => {
    renderApp('/s/webprog/3')
    const main = within(screen.getByRole('main'))
    expect(main.getByRole('link', { name: /Learn/ })).toBeInTheDocument()
    expect(main.queryByRole('link', { name: /Practice/ })).not.toBeInTheDocument()
  })
})

describe('Web Programming I cards count the practice questions (the real exam)', () => {
  it('shows each week\'s number of exam questions on its card', () => {
    renderApp('/s/webprog')
    const card = (n) => screen.getAllByRole('link').find((l) => within(l).queryByText(`Week ${n}`))
    expect(card(1)).toHaveTextContent('2 questions')
    expect(card(2)).toHaveTextContent('6 questions')
    expect(card(3)).toHaveTextContent('0 questions')
    expect(card(4)).toHaveTextContent('9 questions')
    expect(card(5)).toHaveTextContent('8 questions')
    expect(card(1)).toHaveTextContent('0 of 2 answered correctly')
  })

  it('counts 25 on the dashboard and on the Progress page', () => {
    const { unmount } = renderApp('/')
    const course = screen.getAllByRole('link').find((l) => /Web Programming I/.test(l.textContent) && /answered correctly/.test(l.textContent))
    expect(course).toHaveTextContent('0 of 25 answered correctly')
    unmount()
    renderApp('/s/webprog/progress')
    expect(screen.getByText('questions mastered').previousSibling).toHaveTextContent(/^0\/25$/)
  })
})
