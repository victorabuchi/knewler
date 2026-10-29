// Which exercise tasks the past exams were built from, checked against the exam papers and the teacher's exercise pages.
// The lecturer said that three of the exam questions come from the exercises. In all three past exams they were these tasks.
import { pastExams } from './pastExams'

export const examMatches = [
  { tasks: [['bmc-x3-4', 'X3 T4'], ['bmc-x3-5', 'X3 T5']], topic: 'The hexagon automaton',
    exams: ['bmc-past-2025-2', 'bmc-past-2024f-2', 'bmc-past-2024-2'], match: 'Exact',
    how: 'The same figure (Q = {0, ..., 5}, the same transitions, F = {0}) and the same questions: which lengths, which language, minimal or not, and what changes when state 3 accepts. Part d) of the 2025 and 2024 exams asks again about (b) and (c), the re-exam about (a) and (b).' },
  { tasks: [['bmc-x5-2', 'X5 T2']], topic: 'Which grammar is not regular?',
    exams: ['bmc-past-2025-3', 'bmc-past-2024f-3', 'bmc-past-2024-3'], match: 'Exact for 3 of the 5 grammars',
    how: 'X5 a) is exam (b), X5 b) is exam (e) (the one that is not regular) and X5 c) is exam (c). Exam (a) only changes B to ε | bB, and exam (d) A to a: solve them the same way.' },
  { tasks: [['bmc-x6-1', 'X6 T1']], topic: 'In P? In NP? Why?',
    exams: ['bmc-past-2025-1', 'bmc-past-2024f-1'], match: 'Near',
    how: 'The same questions about the knapsack problem instead of subset sum: 2ⁿ subsets to try, but a guessed subset is checked in O(n).' },
  { tasks: [['bmc-x6-1', 'X6 T1'], ['bmc-x6-2', 'X6 T2'], ['bmc-x7-1', 'X7 t1']], topic: 'NP: explain the terms',
    exams: ['bmc-past-2024-1'], match: 'Same topic',
    how: 'Not one task: the definitions are in these answers. Polynomial and exponential time (X6 T2), P and NP with guess and check (X6 T1), NP-hard and NP-complete (X7 t1, independent set).' },
  { tasks: [], topic: 'Course feedback', exams: ['bmc-past-2024-4'], match: 'No exercise',
    how: 'Your own reflection on the course (3 p).' },
]

// "2025 exam Q2" and the exam it is in, for a past-exam question id.
const questionInfo = new Map(pastExams.flatMap((e) => e.questions.map((q) => [q.id, { exam: e.id, label: `${e.short} Q${q.no}` }])))
export const examQuestion = (id) => questionInfo.get(id)

// The matches an exercise task is part of, and the match a past-exam question comes from.
export const matchesOfTask = (taskId) => examMatches.filter((m) => m.tasks.some(([id]) => id === taskId))
export const matchOfQuestion = (questionId) => examMatches.find((m) => m.exams.includes(questionId))
