// English translations and worked answers for the photographed Basic Models of Computation exams.
const weightedAutomaton = (accept) => `start: 0
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
at 0 0 0
at 1 190 190
at 2 380 190
at 3 570 0
at 4 380 -190
at 5 190 -190`

const code = (text) => ({ code: text })

const base = { subject: 'bmc', week: 1, topic: 'bmc-ex1', kind: 'paper' }
const grammarPrompt = [
  'Of the following context-free grammars, most generate regular languages, but one does not.',
  'a) Which grammar does not generate a regular language, and why?',
  'b) Give a regular expression or a finite automaton for the languages of the grammars that are regular.',
  '(In the productions, ε is the empty word.)',
  '(a) S → ε | ABS      A → a | bA      B → ε | bB',
  '(b) S → ε | ABS      A → a | bA      B → ε | bBb',
  '(c) S → ε | ASB      A → a | bA      B → ε | bBb',
  '(d) S → ε | ASB      A → a           B → ε | bBb',
  '(e) S → ε | ASB      A → a           B → b | bBb',
]
const grammarAnswer = [
  '(e) is the non-regular grammar. Here A always produces a, and B produces a positive odd number of b symbols. Each recursive step adds one a on the left and one odd-length b block on the right, so the language requires a non-regular comparison between the two blocks.',
  code('S ⇒ A S B ⇒ a S bBb\n  ⇒ a A S B bBb ⇒ a a S B bBb\n  ⇒ ...\nThe derivation keeps the A-produced symbols on the left and the\nB-produced symbols on the right; this is the dependency to inspect.'),
  'For (a), A = b*a and B = b*, so S generates (b*ab*)*.',
  'For (b), A = b*a and B = (bb)*, so S generates (b*a(bb)*)*.',
  'For (c), A = b*a and B = (bb)*, so S generates b*a(b*a)*(bb)*.',
  'For (d), A = a and B = (bb)*, so S generates a*(bb)*.',
  code('Regular-language answer pattern:\n\n  S ──A──▶ S ──B──▶ (repeat)\n\nReplace A and B by their regular expressions, then apply the\nstandard regular-expression-to-DFA construction.'),
  'Each expression above is regular; a finite automaton can be built from the usual regular-expression construction.',
]
const regular = [
  {
    ...base, id: 'bmc-exam-2024-q1', examSet: 'Final exam 2024', examNo: 1,
    title: 'Final exam 2024 — Question 1. Knapsack problem (8 points)',
    prompt: ['In the knapsack problem, there is a knapsack with a given capacity and a collection of items. Each item has a weight and a value. The question is whether a subset can be chosen so that the total weight is at most the capacity and the total value is at least the target value.', 'a) Does the problem belong to P? Why or why not?', 'b) Does the problem belong to NP? Why or why not?'],
    answer: [
      'Model the decision problem with capacity C and target value V. The certificate is a yes/no choice for each item; the verifier only needs to add the selected weights and values.',
      code('INSTANCE: items (wi, vi), capacity C, target V\n                  │\n                  │ certificate: selected items S\n                  ▼\n        ┌──────────────────────────┐\n        │ verify ΣS wi ≤ C         │\n        │ verify ΣS vi ≥ V         │── yes → accept\n        └──────────────────────────┘\n                  │\n                  └──────────── no → reject'),
      'a) The decision version of knapsack is NP-complete. It is therefore not known to be in P: a polynomial-time algorithm would imply P = NP. It has pseudo-polynomial dynamic-programming algorithms, but those are not polynomial in the bit-length of the input.',
      'b) Yes. A certificate is the chosen subset. In polynomial time, we can add its weights and values and check that the weight is within the capacity and the value reaches the target. Thus knapsack is in NP.',
    ],
  },
  {
    ...base, id: 'bmc-exam-2024-q2', examSet: 'Final exam 2024', examNo: 2,
    title: 'Final exam 2024 — Question 2. Language accepted by an automaton (10 points)',
    prompt: ['The automaton is given by the transition table below. Answer parts a–d based on the diagram.', 'Q = {0, 1, 2, 3, 4, 5}, Σ = {a, b}, start state s = 0, accepting states F = {0}.', 'δ(0,a)=1, δ(0,b)=2; δ(1,a)=2, δ(1,b)=3; δ(2,a)=3, δ(2,b)=4; δ(3,a)=4, δ(3,b)=5; δ(4,a)=5, δ(4,b)=0; δ(5,a)=0, δ(5,b)=1.', 'a) What kind of words does the automaton accept?', 'b) What is its accepted formal language?', 'c) Is the automaton already minimal, or could it still be minimized? Justify briefly.', 'd) If state 1 is also changed from rejecting to accepting, what are the new answers to (a) and (b)?'],
    diagram: weightedAutomaton('0'),
    answerDiagram: weightedAutomaton('0'),
    answer: [
      'Reading a adds 1 and reading b adds 2 to the current state, modulo 6. Therefore the automaton accepts exactly the words whose total weight is 0 modulo 6, where a has weight 1 and b has weight 2.',
      code('state i  ──a──▶ state (i + 1) mod 6\n         └──b──▶ state (i + 2) mod 6\n\nstart: 0                         accept: 0\n0 → 1 → 2 → 3 → 4 → 5 → 0       (on a)\n0 → 2 → 4 → 0                    (on b)'),
      'a) It accepts the words w ∈ {a,b}* for which #a(w) + 2#b(w) ≡ 0 (mod 6).',
      'b) L = { w ∈ {a,b}* | #a(w) + 2#b(w) ≡ 0 (mod 6) }.',
      'c) It is minimal. The six states represent six different remainders; any two different states can be distinguished by a suitable suffix of a-symbols.',
      'd) With state 1 accepting as well, the language becomes { w ∈ {a,b}* | #a(w) + 2#b(w) ≡ 0 or 1 (mod 6) }. The automaton is still minimal.',
    ],
  },
  { ...base, id: 'bmc-exam-2024-q3', examSet: 'Final exam 2024', examNo: 3, title: 'Final exam 2024 — Question 3. Regular and non-regular grammars (10 points)', prompt: grammarPrompt, answer: grammarAnswer },
  {
    ...base, id: 'bmc-exam-2024-q4', examSet: 'Final exam 2024', examNo: 4,
    title: 'Final exam 2024 — Question 4. Course feedback (3 points)',
    prompt: ['What did you learn? What were the good learning experiences in the course? What would you change or develop in the course content? What should be emphasised more in the future?'],
    answer: ['A strong answer is personal but concrete. For example: “I learned how finite automata, regular expressions and regular grammars describe the same regular languages, and how pushdown automata and context-free grammars add a stack and recursion. Drawing automata and tracing strings were useful. I would add more short worked examples before minimisation and grammar-construction tasks, and emphasise how to choose between a DFA, NFA, grammar and regular expression.”', 'The important part is to mention both learning outcomes and a justified suggestion for improving the course.'],
  },
]
const retake = [
  {
    ...base, id: 'bmc-retake-2024-q1', examSet: 'Retake exam 3 May 2024', examNo: 1,
    title: 'Retake exam 3 May 2024 — Question 1. Complexity classes (10 points)',
    prompt: ['Explain briefly what each of the following means (2 points each):', 'a) A polynomial-time algorithm', 'b) P, in terms of the complexity of solving a problem', 'c) NP, in terms of the complexity of solving a problem', 'd) NP-hard', 'e) NP-complete'],
    answer: [
      'Keep the classes and reductions separate. P describes efficient solving; NP describes efficient checking of a proposed yes-answer.',
      code('                 ┌────────────── NP-hard ──────────────┐\n                 │                                      │\n                 │        ┌──────── NP ────────┐        │\n                 │        │                    │        │\n                 │        │   P                │        │\n                 │        │                    │        │\n                 │        └───────┬────────────┘        │\n                 │                │                     │\n                 │                └── NP-complete ──────┘\n                 └──────────────────────────────────────┘\n\nP ⊆ NP (known); whether P = NP is unknown.'),
      'a) A polynomial-time algorithm has running time O(n^k) for some fixed k, where n is the input length.',
      'b) P is the class of decision problems solvable by a deterministic algorithm in polynomial time.',
      'c) NP is the class of decision problems for which a proposed yes-answer can be verified in polynomial time by a deterministic algorithm.',
      'd) An NP-hard problem is at least as hard as every problem in NP: every NP problem can be reduced to it in polynomial time. It need not itself be in NP.',
      'e) An NP-complete problem is both in NP and NP-hard.',
    ],
  },
  {
    ...base, id: 'bmc-retake-2024-q2', examSet: 'Retake exam 3 May 2024', examNo: 2,
    title: 'Retake exam 3 May 2024 — Question 2. Language accepted by an automaton (7 points)',
    prompt: ['The automaton is given by the transition table below. Answer parts a–d based on the diagram.', 'Q = {0, 1, 2, 3, 4, 5}, Σ = {a, b}, start state s = 0, accepting states F = {3}.', 'δ(0,a)=1, δ(0,b)=2; δ(1,a)=2, δ(1,b)=3; δ(2,a)=3, δ(2,b)=4; δ(3,a)=4, δ(3,b)=5; δ(4,a)=5, δ(4,b)=0; δ(5,a)=0, δ(5,b)=1.', 'a) What kind of words does the automaton accept?', 'b) What is its accepted formal language?', 'c) Is the automaton already minimal, or could it still be minimized? Justify briefly.', 'd) If state 1 is also changed from rejecting to accepting, what answers would the new automaton give to (a) and (b)?'],
    diagram: weightedAutomaton('3'),
    answerDiagram: weightedAutomaton('3'),
    answer: [
      'As above, a contributes 1 and b contributes 2 modulo 6. The accepting state is 3, so the final remainder must be 3.',
      code('state i  ──a──▶ state (i + 1) mod 6\n         └──b──▶ state (i + 2) mod 6\n\nstart: 0                         accept: 3\n0 → 1 → 2 → 3 → 4 → 5 → 0       (on a)\n0 → 2 → 4 → 0                    (on b)'),
      'a) It accepts the words w ∈ {a,b}* for which #a(w) + 2#b(w) ≡ 3 (mod 6).',
      'b) L = { w ∈ {a,b}* | #a(w) + 2#b(w) ≡ 3 (mod 6) }.',
      'c) It is minimal: different remainder states can be separated by a suitable suffix of a-symbols.',
      'd) The new language is { w ∈ {a,b}* | #a(w) + 2#b(w) ≡ 1 or 3 (mod 6) }. It remains minimal.',
    ],
  },
  { ...base, id: 'bmc-retake-2024-q3', examSet: 'Retake exam 3 May 2024', examNo: 3, title: 'Retake exam 3 May 2024 — Question 3. Regular and non-regular grammars (10 points)', prompt: grammarPrompt, answer: grammarAnswer },
]
export const questions = [...regular, ...retake]
