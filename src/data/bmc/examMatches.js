// Which exercise tasks the past exams were built from, checked against the exam papers and the teacher's exercise pages.
// The lecturer said that three of the exam questions come from the exercises. The 2026 exam used four other tasks (first here),
// the 2025 exam, the 2024 exam and the 2024 re-exam the ones after them.
// `write` is what to write in the exam: the teacher's solution cut down to the result, the reason and the key steps.
import { EXAM_2026, EXAM_REGEX, pastExams } from './pastExams'

const code = (text) => ({ code: text })
const regex = (r) => (r.startsWith('|') ? `ε | ${r.slice(1)}` : r) // '' | x is written ε | x

export const examMatches = [
  // ---------- the 2026 exam ----------
  { tasks: [['bmc-x6-1', 'X6 T1']], topic: 'Factorization: in P? In NP?', showQuestion: true, // the 2026 exam page shows the exam question
    exams: ['bmc-past-2026-1'], match: 'Near',
    how: 'The same questions as X6 T1 about another problem. The new part: the input is a number k, so the size of the input is the number of digits of k.',
    write: [
      code(`Time complexity:
k has n digits (n ≈ log k),
so the time is measured in n.
Trial division: try 2, 3, ..., √k
√k ≈ 10^(n/2) divisions
→ exponential: O(10^(n/2))
(20 digits: 10¹⁰ divisions,
 100 digits: 10⁵⁰)

How to analyze it: count the
steps as a function of the input
length n (the digits), like the
2ⁿ subsets of subset sum.

P?  Not known (as far as is
    known, no). No polynomial
    algorithm is known (RSA
    encryption relies on this).

NP? Yes. Nondeterministically:
    guess the factors k1, ..., km
    multiply them: polynomial
    compare with k: 1 step
    → checked in polynomial
      time → NP`),
      'The same pattern as subset sum (X6 T1): many possibilities to try, but a guess is checked fast. Say that the size of the input is the number of digits, not k: that is why √k divisions is not polynomial.',
    ] },
  { tasks: [['bmc-x7-4', 'X7 t4']], topic: 'Draw the languages as finite automata',
    exams: ['bmc-past-2026-2'], match: 'Exact',
    how: 'The same five languages: a*cb*, (ab)*, (abba)*, a+b+ and (0|1)^8.',
    write: [
      'Draw each one: an arrow into the start state, double circles for the accepting states, one arrow per symbol. In words:',
      code(EXAM_2026.automata),
      'Missing arrows reject (like in JFLAP), or draw one trap state that all of them go to.',
    ] },
  { tasks: [['bmc-x5-2', 'X5 T2']], topic: 'Regular or not? Three grammars',
    exams: ['bmc-past-2026-3'], match: 'Exact except one rule',
    how: 'The three grammars of X5 T2, but in b) B got one more alternative: B → b | bBb | ε. That ε makes b) regular.',
    write: [
      code(`What each part produces:
A → a | bA       A = b*a
A → a            A = a
B → ε | bBb      B = (bb)*
B → b | bBb | ε  B = b*
S → ε | ABS      (AB)*
S → ε | ASB      AⁿBⁿ
B = b*: any number of b's
AⁿBⁿ: as many B's as A's

a) regular: ${regex(EXAM_2026.regex.a)}
b) regular: ${regex(EXAM_2026.regex.b)}
   S ⇒ AⁿSBⁿ ⇒ aⁿ b*…b*
     = aⁿb*  (n ≥ 1)
   the b's do not depend on n:
   aaa, ab, abbbb are all in it.
   Without "| ε": B = b(bb)*,
   #b ≥ #a → not regular.
c) regular: ${regex(EXAM_2026.regex.c)}
   B can be ε:
   (bb)*(bb)*…(bb)* = (bb)*,
   nothing has to be counted.`),
    ] },
  { tasks: [['bmc-x5-4', 'X5 T4']], topic: 'Which model recognizes each language?',
    exams: ['bmc-past-2026-4'], match: 'Exact',
    how: 'The same four languages over {0, 1}: 0ⁿ1ⁿ, (0|1)*10, 0ⁿ0ⁿ and 0ᵖ1ʳ0ᵖ⁻ʳ.',
    write: [
      code(`a) 0ⁿ1ⁿ (n ≥ 1): n zeros, then as many ones
   PDA: push the 0s, pop one for each 1,
   the stack is empty at the end.
   Not an FA: n has no upper limit.
b) (0|1)*10: strings that end with 10
   FA: remember the last two symbols (3 states).
c) 0ⁿ0ⁿ = (00)*: an even number of zeros
   FA with 2 states (even / odd).
d) 0ᵖ1ʳ0ᵖ⁻ʳ (p ≥ r): p zeros, r ones, p − r zeros
   PDA: push the first 0s, pop one for each 1
   and for each 0 of the last block.

FA = fixed memory, PDA = one stack (one count),
TM = a tape (several counts, e.g. aⁿbⁿcⁿ)`),
    ] },

  // ---------- the 2025 exam, the 2024 exam and the 2024 re-exam ----------
  { tasks: [['bmc-x3-4', 'X3 T4'], ['bmc-x3-5', 'X3 T5']], topic: 'The hexagon automaton',
    exams: ['bmc-past-2025-2', 'bmc-past-2024f-2', 'bmc-past-2024-2'], match: 'Exact',
    how: 'The same figure (Q = {0, ..., 5}, the same transitions, F = {0}) and the same questions: which lengths, which language, minimal or not, and what changes when state 3 accepts. Part d) of the 2025 and 2024 exams asks again about (b) and (c), the re-exam about (a) and (b).',
    write: [
      code(`δ(i, a) = i + 1 (mod 6),  δ(i, b) = i + 2 (mod 6)
→ the state is the weighted sum of the word: a = 1, b = 2 (mod 6)

a) Accepts ε and words of every length n ≥ 3. Rejects lengths 1 and 2.
   n symbols weigh from n (all a) to 2n (all b):
   n = 1: {1, 2},  n = 2: {2, 3, 4}  → no multiple of 6
   n ≥ 3: [n, 2n] always has a multiple of 6  (bbb = 6, aabb = 6, aaaab = 6)

b) L = { w ∈ {a,b}* | |w|a + 2|w|b ≡ 0 (mod 6) }

c) Already minimal. Partition method:
   P0 = {0}, {1,2,3,4,5}               accepting / not accepting
   P1 = {0}, {1,2,3}, {4}, {5}         4 –b→ 0 and 5 –a→ 0
   P2 = {0}, {1}, {2}, {3}, {4}, {5}   1 → (2,3), 2 → (3,4), 3 → (4,5)
   All states are separate → no states can be merged.

d) States 0 and 3 accepting:
   (a) accepts ε and every length n ≥ 2; rejects length 1 (1, 2 ≢ 0 mod 3)
       e.g. ab = 3, ba = 3, aaa = 3
   (b) L = { w ∈ {a,b}* | |w|a + 2|w|b ≡ 0 (mod 3) }   (because 0 ≡ 3 mod 3)
   (c) not minimal any more:
       P0 = {0,3}, {1,2,4,5}
       P1 = {0,3}, {1,4}, {2,5}   → stable: 3 states (the remainder mod 3)
       {0,3} –a→ {1,4} –a→ {2,5} –a→ {0,3}
       {0,3} –b→ {2,5} –b→ {1,4} –b→ {0,3}`),
      'Answer only the parts of d) that are asked: the 2025 and 2024 exams ask (b) and (c), the re-exam (a) and (b). Draw the 3-state automaton for (c).',
    ] },
  { tasks: [['bmc-x5-2', 'X5 T2']], topic: 'Which grammar is not regular?',
    exams: ['bmc-past-2025-3', 'bmc-past-2024f-3', 'bmc-past-2024-3'], match: 'Exact for 3 of the 5 grammars',
    how: 'X5 a) is exam (b), X5 b) is exam (e) (the one that is not regular) and X5 c) is exam (c). Exam (a) only changes B to ε | bB, and exam (d) A to a: solve them the same way.',
    write: [
      code(`What each part produces:
A → a | bA     A = b*a
A → a          A = a
B → ε | bB     B = b*
B → ε | bBb    B = (bb)*
B → b | bBb    B = b(bb)*   (an odd number of b's, at least one)
S → ε | ABS    ABAB...  = (AB)*
S → ε | ASB    AⁿBⁿ     (as many B's as A's)

a) (e) is not regular.
   S ⇒ ASB ⇒ AASBB ⇒ AABB ⇒ aabb: every a gets at least one b after it
   L(e) = {ε} ∪ { aⁿbᵐ | n ≥ 1, m ≥ n, m − n even }
   A finite automaton has finitely many states, so it cannot count the a's:
   if aⁱ and aʲ (i < j) end in the same state, it also accepts aʲbⁱ (wrong).
   It needs a stack: a pushdown automaton.

b) (a) ${regex(EXAM_REGEX.a)}
   (b) ${regex(EXAM_REGEX.b)}
   (c) ${regex(EXAM_REGEX.c)}
   (d) ${regex(EXAM_REGEX.d)}
   (c) and (d) are regular although S → ASB: B can be ε, so
   (bb)*(bb)*...(bb)* = (bb)* and nothing has to be counted.`),
    ] },
  { tasks: [['bmc-x6-1', 'X6 T1']], topic: 'In P? In NP? Why?',
    exams: ['bmc-past-2025-1', 'bmc-past-2024f-1'], match: 'Near',
    how: 'The same questions about the knapsack problem instead of subset sum: 2ⁿ subsets to try, but a guessed subset is checked in O(n).',
    write: [
      code(`n items, each one is in the knapsack or not → 2ⁿ subsets

a) Not in P (as far as is known).
   No polynomial algorithm is known: trying all subsets is O(2ⁿ), exponential.
   Knapsack is NP-hard (its yes/no version is NP-complete), so a polynomial
   algorithm would mean P = NP.

b) Yes, in NP (the yes/no version: is there a subset with
   total volume ≤ capacity and total value ≥ k?)
   guess a subset               n
   add the volumes and values   ~2n
   compare with the limits      2
   → a solution is checked in O(n), polynomial time → NP`),
      'The same answer works for subset sum (X6 T1), SAT (X6 T3) and independent set (X7 t1): count the choices (2ⁿ), then guess and check in polynomial time.',
    ] },
  { tasks: [['bmc-x6-1', 'X6 T1'], ['bmc-x6-2', 'X6 T2'], ['bmc-x7-1', 'X7 t1']], topic: 'NP: explain the terms',
    exams: ['bmc-past-2024-1'], match: 'Same topic',
    how: 'Not one task: the definitions are in these answers. Polynomial and exponential time (X6 T2), P and NP with guess and check (X6 T1), NP-hard and NP-complete (X7 t1, independent set).',
    write: [
      code(`a) Polynomially bounded time: at most c·nᵏ steps for a fixed k,
   e.g. O(n), O(n²). Exponential O(2ⁿ) grows much faster.
b) P: problems a deterministic algorithm solves in polynomial time,
   e.g. finding a number in a sorted list, running a DFA on a word.
c) NP: problems whose proposed solution can be checked in polynomial time
   (a nondeterministic machine guesses the solution and checks it),
   e.g. subset sum: guess, add up, compare → O(n).  P ⊆ NP.
d) NP-hard: at least as hard as every NP problem: every NP problem can be
   reduced to it in polynomial time. It need not be in NP itself
   (e.g. the halting problem).
e) NP-complete: in NP and NP-hard, the hardest problems in NP,
   e.g. SAT, subset sum, independent set. A polynomial algorithm for one
   of them would mean P = NP.`),
    ] },
  { tasks: [], topic: 'Course feedback', exams: ['bmc-past-2024-4'], match: 'No exercise',
    how: 'Your own reflection on the course (3 p).',
    write: [
      'Answer every question in one or two concrete sentences, in your own words:',
      code(`What I learned:        e.g. finite automata, grammars and regular expressions
                       describe the same languages; a PDA adds a stack
Best experience:       e.g. minimizing an automaton by hand
What stuck in mind:    e.g. P vs NP
What I would change:   one concrete suggestion and why
Why it matters to me:  e.g. regular expressions and parsing in programming`),
    ] },
]

// "2025 exam Q2" and the exam it is in, for a past-exam question id.
const questionInfo = new Map(pastExams.flatMap((e) => e.questions.map((q) => [q.id, { exam: e.id, label: `${e.short} Q${q.no}` }])))
export const examQuestion = (id) => questionInfo.get(id)

// The matches an exercise task is part of, and the match a past-exam question comes from.
export const matchesOfTask = (taskId) => examMatches.filter((m) => m.tasks.some(([id]) => id === taskId))
export const matchOfQuestion = (questionId) => examMatches.find((m) => m.exams.includes(questionId))
