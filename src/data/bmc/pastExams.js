// Past BMC exams (Laskennan perusmallit), translated from Finnish and solved the way the teacher solves the exercises:
// examine derivations, partition steps P0, P1 ..., examples and "why does |w| = 1 fail" checks. `original` keeps the Finnish text.
// The answers are checked in pastExams.test.js. These questions are not part of the course progress totals.
const automaton = (accept) => `start: 0
accept: ${accept}
0 a -> 1
0 b -> 2
1 a -> 2
1 b -> 3
2 a -> 3
2 b -> 4
3 a -> 4
3 b -> 5
4 a -> 5
4 b -> 0
5 a -> 0
5 b -> 1
at 0 0 120
at 1 120 280
at 2 330 280
at 3 440 120
at 4 330 -40
at 5 120 -40`

export const EXAM_AUTOMATON = automaton('0')
export const EXAM_AUTOMATON_3 = automaton('0 3')
export const EXAM_AUTOMATON_MIN = `start: 0
accept: 0
0 a -> 1
0 b -> 2
1 a -> 2
1 b -> 0
2 a -> 0
2 b -> 1
layout: circle`

// The five grammars of question 3 (as in the exam) and the answers for the regular ones.
export const EXAM_GRAMMARS = {
  a: 'S → ε | ABS\nA → a | bA\nB → ε | bB',
  b: 'S → ε | ABS\nA → a | bA\nB → ε | bBb',
  c: 'S → ε | ASB\nA → a | bA\nB → ε | bBb',
  d: 'S → ε | ASB\nA → a\nB → ε | bBb',
  e: 'S → ε | ASB\nA → a\nB → b | bBb',
}
export const EXAM_REGEX = { a: '(b*ab*)*', b: '(b*a(bb)*)*', c: '|(b*a)(b*a)*(bb)*', d: '|aa*(bb)*' }

const code = (text) => ({ code: text })
const t = (label, wiki) => ({ label, wiki, noGlossary: true })
const TERMS = {
  np: [t('P (complexity)', 'P_(complexity)'), t('NP (complexity)', 'NP_(complexity)'), t('NP-completeness', 'NP-completeness')],
  knapsack: [t('Knapsack problem', 'Knapsack_problem'), t('NP (complexity)', 'NP_(complexity)'), t('NP-hardness', 'NP-hardness')],
  dfa: [t('Deterministic finite automaton (DFA)', 'Deterministic_finite_automaton'), t('Modular arithmetic (mod)', 'Modular_arithmetic'), t('DFA minimization', 'DFA_minimization')],
  grammar: [t('Regular grammar', 'Regular_grammar'), t('Context-free grammar', 'Context-free_grammar'), t('Regular expression', 'Regular_expression')],
}

// ---------- the shared questions ----------
const lengthsAnswer = [
  'Reading a adds 1 and reading b adds 2 to the state number, modulo 6: state i means "the weighted sum is i (mod 6)". This is the same automaton as exercise 3, tasks 4 and 5.',
  code('state i ──a──▶ (i + 1) mod 6\nstate i ──b──▶ (i + 2) mod 6\nstart 0, accepting 0'),
  'Examples: accepts ε (|w| = 0). Rejects a, b, aa, ab, ba, bb (all |w| = 1 or 2). Accepts bbb, aabb, aaaab, aaaaaa (|w| = 3, 4, 5, 6).',
  'Why |w| = 1 fails: n = 1 gives the possible weights {1, 2}: x = 1, y = 0 → 1 ≢ 0 (mod 6) (state 1), or x = 0, y = 1 → 2 ≢ 0 (state 2).\nWhy |w| = 2 fails: weights {2, 3, 4}: aa = 2 (state 2), ab = 3 (state 3), bb = 4 (state 4).\nWith n symbols (x a\'s, y b\'s, n = x + y) the weight x + 2y can be anything from n (all a) to 2n (all b). For n ≥ 3 the range [n, 2n] always contains a multiple of 6 (n = 3: {3, 4, 5, 6}), for n = 1 and n = 2 it does not.',
]
const minimalAnswer = [
  'Use the partition method. P0: accepting and non-accepting states. Then split the states of a group that go to different groups.',
  code('P0 = {0}, {1, 2, 3, 4, 5}\n     on (a, b): 1 → (2, 3) both non-acc.,  2 → (3, 4) both non-acc.,  3 → (4, 5) both non-acc.\n                4 → (5, 0) non-acc. / acc.,  5 → (0, 1) acc. / non-acc.\nP1 = {0}, {1, 2, 3}, {4}, {5}\n     1 → (2, 3) both in {1,2,3},  2 → (3, 4) {1,2,3} / {4},  3 → (4, 5) {4} / {5}\nP2 = {0}, {1}, {2}, {3}, {4}, {5}'),
  'All states are separate: no states can be merged, so the automaton is already minimal. (Each state is a different remainder mod 6; reading some a\'s tells them apart.)',
  'The teacher\'s answer to exercise 3 task 5 splits one group at a time (P1 = {q0}, {q1,q2,q3}, {q4,q5}; P2 = {q0}, {q1}, {q2,q3}, {q4,q5}; P3 splits q2, q3; then q4, q5). Both ways end the same: all six states are separate, the DFA was already minimal.',
]
const state3Language = 'L = { w ∈ {a,b}* | |w|a + 2|w|b ≡ 0 (mod 3) }: the weighted sum is a multiple of 3 (each a worth 1, each b worth 2). States 0 and 3 accept, and 0 ≡ 3 (mod 3).'
const state3Minimal = [
  'Now the automaton is not minimal any more. P0 = {0, 3}, {1, 2, 4, 5}. On (a, b): 1 → (2, 3), 4 → (5, 0) both go to (non-acc., acc.); 2 → (3, 4), 5 → (0, 1) both go to (acc., non-acc.). So P1 = {0, 3}, {1, 4}, {2, 5}, and this does not split any more.',
  code('P0 = {0, 3}, {1, 2, 4, 5}\nP1 = {0, 3}, {1, 4}, {2, 5}   (stable)\n\nminimized: 3 states = the remainder mod 3\n{0,3} ──a──▶ {1,4} ──a──▶ {2,5} ──a──▶ {0,3}\n{0,3} ──b──▶ {2,5} ──b──▶ {1,4} ──b──▶ {0,3}'),
]
const state3Lengths = 'Lengths: accepts ε (|w| = 0), rejects every word of length 1 (a gives 1, b gives 2, neither ≡ 0 mod 3), and accepts some word of every length from 2 on: |w| = 2 has the weights {2, 3, 4}, and ab, ba = 3 ≡ 0; |w| = 3: aaa = 3, bbb = 6. For n ≥ 2 the range [n, 2n] always contains a multiple of 3.'

const grammarPrompt = (fi) => fi
  ? ['Seuraavista kontekstittomien kielioppien tuottamista kielistä suurin osa on säännöllisiä, mutta yksi ei ole. (10 p)', 'a) Mikä kielistä ei ole säännöllinen, miksi? (2 p)', 'b) Anna säännöllisiä kieliä vastaavat säännöllinen lauseke tai äärellinen automaatti niiden osalta, jotka ovat säännöllisiä. (8 p)']
  : ['Of the languages generated by the following context-free grammars, most are regular, but one is not. (10 points)', 'a) Which of the languages is not regular, and why? (2 p)', 'b) For the languages that are regular, give a corresponding regular expression or finite automaton. (8 p)', '(a)  S → ε | ABS      A → a | bA      B → ε | bB\n(b)  S → ε | ABS      A → a | bA      B → ε | bBb\n(c)  S → ε | ASB      A → a | bA      B → ε | bBb\n(d)  S → ε | ASB      A → a           B → ε | bBb\n(e)  S → ε | ASB      A → a           B → b | bBb']
const grammarAnswer = [
  'Examine different possible derivations, like in exercise 5 task 2. First what each nonterminal produces:',
  code('A → a | bA      0...n symbols b before the symbol a:  A = b*a\nA → a           exactly one a:                         A = a\nB → ε | bB      0...n symbols b:                       B = b*\nB → ε | bBb     0...n strings "bb":                    B = (bb)*\nB → b | bBb     an odd number of b\'s (at least one):   B = b(bb)*'),
  'Then the S-rules. S → ABS adds a new pair AB after the previous ones: ABAB... S → ASB puts A\'s on the left and the same number of B\'s on the right: A...A S B...B = AᵏBᵏ.',
  'a) Grammar (e) is not regular. S → ASB → aSB → aASBB → aaASBBB → aaaBBB, and every B produces at least one b (an odd number). So for every a there is at least one b after it, and b\'s only come together with a\'s: L(e) = {ε} ∪ { aⁿbᵐ | n ≥ 1, m ≥ n, m − n even }. S ⇒ aaabbb (aⁿbⁿ), or with B → bBb more b\'s (aaabbbbbbbbb). The number of b\'s can exceed the number of a\'s but can never be smaller.',
  'Why a finite automaton cannot do it: it would have to remember how many a\'s were read, and that number is unbounded. With k states, two of the prefixes a⁰, a¹, ..., aᵏ end in the same state, say aⁱ and aʲ with i < j. aⁱbⁱ is accepted, so aʲbⁱ would be accepted too, but it has more a\'s than b\'s. A pushdown automaton is required (push for every a, pop for the b\'s).',
  'b) The regular ones:',
  code('(a)  A = b*a, B = b*, pattern ABAB...      (b*ab*)*\n     = ε or any word with at least one a:  ε | (a|b)*a(a|b)*\n\n(b)  A = b*a, B = (bb)*, pattern ABAB...   (b*a(bb)*)*\n\n(c)  A = b*a, B = (bb)*, pattern AᵏBᵏ      ε | (b*a)(b*a)*(bb)*\n\n(d)  A = a,   B = (bb)*, pattern AᵏBᵏ      ε | aa*(bb)*'),
  'Why (c) and (d) are regular although S → ASB pairs every A with a B: B can also produce ε, so the number of B\'s cannot be seen in the word. (bb)*(bb)*...(bb)* with k ≥ 1 factors is just (bb)*. Only k = 0 is special: then the word is ε (a pure b-string like bb needs a matching A, which ends in a). In (e) the B\'s cannot be empty, which is exactly why (e) is not regular.',
]
const feedbackAnswer = [
  'There is no single right answer: the points come from an honest, concrete reflection. Answer all the parts:',
  code('What did I learn?          e.g. automata, regular expressions and grammars describe the same\n                           regular languages; a PDA adds a stack, a Turing machine a tape\nBest learning experiences  e.g. drawing and testing automata in JFLAP, minimizing by hand\nWhat stuck in my mind      e.g. the Chomsky hierarchy, P vs NP\nHow I would change it      one concrete, justified suggestion\nWhy it matters to me       e.g. parsing, compilers, regular expressions in code, complexity'),
]

// The final exam (Lopputentti, 28 p): the same paper in 2025 and 2024, so both exams use these questions, each with its own ids.
const finalExam = (prefix, name) => [
  { id: `${prefix}-1`, no: 1, points: 8, terms: TERMS.knapsack,
    title: `${name}, question 1. The knapsack problem (8 p)`,
    prompt: ['In the knapsack problem there is a knapsack with a certain capacity, and a set of items, each with a volume and a value. The core of the problem is to choose a (sub)set of the items such that they fit in the knapsack (their total volume is less than or equal to the capacity of the knapsack) and their total value is as large as possible.', 'a) Does the problem belong to the class P? Why does it / does it not?', 'b) Does the problem belong to the class NP? Why does it / does it not?'],
    original: ['Reppuongelma (8 p.) Reppuongelmassa on tietyn tilavuuden omaava reppu, sekä joukko esineitä, joilla on tilavuus sekä arvo. Ongelman ydin on valikoida esineistä sellainen (osa)joukko, että ne mahtuvat reppuun (yhteen laskettu tilavuus on pienempi tai yhtä suuri, kuin repun tilavuus) ja niiden yhteenlaskettu arvo on mahdollisimman suuri.', 'a) Kuuluuko ongelma luokkaan P? Miksi kuuluu/ei kuulu?', 'b) Kuuluuko ongelma luokkaan NP? Miksi kuuluu/ei kuulu?'],
    answer: [
      'Analyze it like the subset sum problem (exercise 6 task 1). Counting subsets: each of the n items has two options, it is in the knapsack or not, so there are 2ⁿ subsets: exponential growth. Brute force checks all 2ⁿ subsets (and adds up each one), and there is no general shortcut that avoids guessing.',
      code('P  = polynomial time, n^k for a fixed k (e.g. O(n), O(n²))\nNP = nondeterministic polynomial time: a proposed solution can be\n     verified in polynomial time, even if finding it may be hard\nexponential time = O(k^n) with a fixed base k > 1'),
      'a) No (as far as is known). No algorithm is known that solves the knapsack problem in polynomial time: the knapsack problem is NP-hard (its yes/no version is NP-complete), so a polynomial algorithm would mean P = NP. Dynamic programming takes O(n·C) steps for capacity C, but that is not polynomial in the length of the input, because C is written with only about log C digits.',
      'b) Yes, in its yes/no (decision) form: "is there a subset with total volume ≤ capacity and total value ≥ V?". Nondeterministically: guess 0...n items (n), add up their volumes and values (about 2n operations), compare with the capacity and V (2): O(n), polynomial. So a proposed solution can be checked in polynomial time → NP. (It is also NP-hard, so it is NP-complete, like independent set in exercise 7.)',
      'Also: strictly, NP contains yes/no problems. The form in the exam asks for the largest value (an optimization problem), which is NP-hard; its decision version above is the one in NP. Saying this shows you know the difference.',
    ] },
  { id: `${prefix}-2`, no: 2, points: 10, terms: TERMS.dfa, diagram: EXAM_AUTOMATON,
    title: `${name}, question 2. The language of an automaton (10 p)`,
    prompt: ['Answer parts a–d based on the figure.', 'Q = {0, 1, 2, 3, 4, 5}, Σ = {a, b}, s = 0, F = {0}\nδ(0,a)=1, δ(0,b)=2\nδ(1,a)=2, δ(1,b)=3\nδ(2,a)=3, δ(2,b)=4\nδ(3,a)=4, δ(3,b)=5\nδ(4,a)=5, δ(4,b)=0\nδ(5,a)=0, δ(5,b)=1', 'a) What lengths of words does the automaton accept? (2 p)\nb) What is the formal language it accepts? (2 p)\nc) Is the automaton of figure 1 already minimal, or could it still be minimized? Justify your answer briefly. (2 p)\nd) If in figure 1 state 3 is also changed from rejecting to accepting, what answers would the new automaton give to questions (b) and (c)? (4 p)'],
    original: ['Automaatin hyväksymä kieli. Vastaa kohtiin a-d kuvan perusteella (10 p)', 'a) Minkä mittaisia sanoja automaatti hyväksyy? (2 p)\nb) Mikä on sen hyväksymä formaali kieli? (2 p)\nc) Onko kuvan 1 automaatti jo minimaalinen vai voisiko sitä vielä minimoida? Perustele vastauksesi lyhyesti. (2p)\nd) Jos kuvassa 1 vaihdetaankin myös tila 3 hylkäävästä hyväksyväksi, niin millaiset vastaukset uusi automaatti antaisi kysymyksiin (b) ja (c)? (4 p)', '(alku = start, Kuva 1: Tehtävän 2 automaatti = Figure 1: the automaton of task 2)'],
    answer: [
      ...lengthsAnswer,
      'a) It accepts the empty word and words of every length from 3 on (for each length n ≥ 3 some, not all, words); no word of length 1 or 2.',
      'b) L = { w ∈ {a,b}* | |w|a + 2|w|b ≡ 0 (mod 6) }: the weighted count of the symbols is a multiple of 6, each a worth 1 and each b worth 2.',
      'c) ' + minimalAnswer[0], ...minimalAnswer.slice(1),
      'd) (b) with states 0 and 3 accepting: ' + state3Language,
      'd) (c) ' + state3Minimal[0], state3Minimal[1],
    ],
    answerDiagrams: [{ label: 'd) the minimized automaton (mod 3)', text: EXAM_AUTOMATON_MIN }] },
  { id: `${prefix}-3`, no: 3, points: 10, terms: TERMS.grammar,
    title: `${name}, question 3. Which grammar is not regular? (10 p)`,
    prompt: grammarPrompt(false), original: grammarPrompt(true), answer: grammarAnswer },
]

export const pastExams = [
  {
    id: 'final-2025', short: '2025 exam', title: '2025 exam (14.3.2025)', finnishTitle: 'Lopputentti 14.3.2025', points: 28,
    images: ['bmc-final-2025-1.jpg', 'bmc-final-2025-2.jpg'],
    instructions: 'Calculators may not be used or even be present in the exam. JUSTIFYING your answers is important: the grader cannot get inside your head to see how the solution was formed, so justify your answers.',
    questions: finalExam('bmc-past-2025', '2025 exam'),
  },
  {
    id: 'final-2024', short: '2024 exam', title: '2024 exam', finnishTitle: 'Lopputentti', points: 28,
    images: ['bmc-final-2024-1.jpg', 'bmc-final-2024-2.jpg'],
    instructions: 'Calculators may not be used or even be present in the exam. JUSTIFYING your answers is important: the grader cannot get inside your head to see how the solution was formed, so justify your answers.',
    note: 'The paper has no date. Its questions are word for word the same as the 2025 exam, so the answers are the same too.',
    questions: finalExam('bmc-past-2024f', '2024 exam'),
  },
  {
    id: 'retake-2024', short: '2024 re-exam', title: '2024 re-exam (3.5.2024)', finnishTitle: 'Uusintatentti 3.5.2024', points: 30,
    images: ['bmc-retake-2024-1.jpg', 'bmc-retake-2024-2.jpg'],
    instructions: '',
    questions: [
      { id: 'bmc-past-2024-1', no: 1, points: 10, terms: TERMS.np,
        title: '2024 re-exam, question 1. NP (10 p)',
        prompt: ['Explain in your own words what the following mean (2 p each, 10 p in total):', 'a) Polynomially bounded time complexity\nb) P, when talking about the complexity of a problem to be solved\nc) NP, when talking about the complexity of a problem to be solved\nd) NP-hard\ne) NP-complete'],
        original: ['NP. Selitä omin sanoin mitä tarkoittavat (2 p /kohta, yht 10 p.)', 'a) Polynomisesti rajattu aikavaativuus\nb) P, puhuttaessa ratkaistavan ongelman vaativuudesta\nc) NP, puhuttaessa ratkaistavan ongelman vaativuudesta\nd) NP kova (NP hard)\ne) NP täydellinen (NP complete)'],
        answer: [
          'a) The running time grows at most like a polynomial of the input size n: at most c · nᵏ steps for some fixed k, O(nᵏ), e.g. O(n) or O(n²). Linear is polynomial too. The opposite is exponential time, O(kⁿ) with a fixed base k > 1 (e.g. 2ⁿ when all subsets are tried).',
          'b) P is the class of (yes/no) problems that a deterministic algorithm (a deterministic Turing machine) solves in polynomial time. Example: is a number in a sorted list (O(log n)), does a string match a regular expression.',
          'c) NP (nondeterministic polynomial time) is the class of problems for which a proposed solution can be verified in polynomial time, even though finding the solution may take exponential time. Equivalently: a nondeterministic machine that "guesses" the solution solves them in polynomial time. Example: subset sum: guess the numbers (n), add them (n − 1), compare with S (1): O(n). P ⊆ NP; whether P = NP is unknown.',
          'd) NP-hard: at least as hard as every problem in NP: every NP problem can be reduced (transformed) to it in polynomial time, so a fast algorithm for it would solve all of NP. An NP-hard problem does not have to be in NP itself (e.g. the optimization version of knapsack, or the halting problem).',
          'e) NP-complete: in NP AND NP-hard. The hardest problems inside NP; solutions are easy to check, no polynomial algorithm is known. Examples: SAT, subset sum, independent set, the decision version of knapsack.',
          code('P ⊆ NP                       every problem that is solved fast can also be checked fast\nNP-complete = NP ∩ NP-hard   the hardest problems inside NP\nNP-hard can be outside NP    e.g. the halting problem\nP = NP ?                     unknown (the most famous open question)'),
        ] },
      { id: 'bmc-past-2024-2', no: 2, points: 7, terms: TERMS.dfa, diagram: EXAM_AUTOMATON,
        title: '2024 re-exam, question 2. The language of an automaton (7 p)',
        prompt: ['Answer parts a–d based on the figure (the same automaton as in the 2025 and 2024 exams: Σ = {a, b}, start 0, accepting 0; δ(i, a) = i + 1 and δ(i, b) = i + 2, modulo 6).', 'a) What lengths of words does the automaton accept? (1 p)\nb) What is the formal language it accepts? (2 p)\nc) Is the automaton of figure 1 already minimal, or could it still be minimized? Justify your answer briefly. (2 p)\nd) If in figure 1 state 3 is also changed from rejecting to accepting, what answers would the new automaton give to questions (a) and (b)? (2 p)'],
        original: ['Automaatin hyväksymä kieli. Vastaa kohtiin a-d kuvan perusteella (7 p)', 'a) Minkä mittaisia sanoja automaatti hyväksyy? (1 p)\nb) Mikä on sen hyväksymä formaali kieli? (2 p)\nc) Onko kuvan 1 automaatti jo minimaalinen vai voisiko sitä vielä minimoida? Perustele vastauksesi lyhyesti. (2p)\nd) Jos kuvassa 1 vaihdetaankin myös tila 3 hylkäävästä hyväksyväksi, niin millaiset vastaukset uusi automaatti antaisi kysymyksiin (a) ja (b)? (2 p)'],
        answer: [
          ...lengthsAnswer,
          'a) The empty word and words of every length from 3 on; no word of length 1 or 2.',
          'b) L = { w ∈ {a,b}* | |w|a + 2|w|b ≡ 0 (mod 6) }.',
          'c) ' + minimalAnswer[0], ...minimalAnswer.slice(1),
          'd) (a) with states 0 and 3 accepting: ' + state3Lengths,
          'd) (b) ' + state3Language,
        ] },
      { id: 'bmc-past-2024-3', no: 3, points: 10, terms: TERMS.grammar,
        title: '2024 re-exam, question 3. Which grammar is not regular? (10 p)',
        prompt: grammarPrompt(false), original: grammarPrompt(true), answer: grammarAnswer },
      { id: 'bmc-past-2024-4', no: 4, points: 3, terms: [],
        title: '2024 re-exam, question 4. Course feedback (3 p)',
        prompt: ['What did you learn? What were your best learning experiences in the course? What stuck in your mind? How would you change or develop the course content? How important do you see the course content in your future?'],
        original: ['Mitä opin? Mitkä olivat parhaat oppimiskokemuksesi kurssilla? Mikä jäi mieleen? Miten muuttaisit tai kehittäisit kurssin sisältöä? Miten tärkeänä näet kurssin sisällön tulevaisuudessasi? (3 p.)'],
        answer: feedbackAnswer },
    ],
  },
]

// Every past-exam question as a task the PaperQuestion component can show (no teacher's page; the answer is typed).
export const pastExamItems = pastExams.flatMap((exam) => exam.questions.map((q) => ({ ...q, subject: 'bmc', kind: 'paper', exam: exam.id, exercise: exam.title })))
