// Past BMC exams (Laskennan perusmallit), translated from Finnish and solved the way the teacher solves the exercises:
// examine derivations, partition steps P0, P1 ..., examples and "why does |w| = 1 fail" checks. `original` keeps the Finnish text.
// The answers are checked in pastExams.test.js. These questions are not part of the course progress totals.
import { FA7 } from './exercise7'

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
  : ['Of the languages generated by the following context-free grammars, most are regular, but one is not. (10 points)', 'a) Which of the languages is not regular, and why? (2 p)', 'b) For the languages that are regular, give a corresponding regular expression or finite automaton. (8 p)', '(a)  S → ε | ABS,  A → a | bA,  B → ε | bB\n(b)  S → ε | ABS,  A → a | bA,  B → ε | bBb\n(c)  S → ε | ASB,  A → a | bA,  B → ε | bBb\n(d)  S → ε | ASB,  A → a,  B → ε | bBb\n(e)  S → ε | ASB,  A → a,  B → b | bBb']
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

// ---------- the 2026 exam (30.10.2026), written down from memory right after the exam ----------
// Question 2 is exercise 7 task 4, question 3 exercise 5 task 2 with one change in b) (B → b | bBb | ε), question 4 exercise 5 task 4.
export const EXAM_2026 = {
  grammars: {
    a: 'S → ε | ABS\nA → a | bA\nB → ε | bBb',
    b: 'S → ε | ASB\nA → a\nB → b | bBb | ε',
    c: 'S → ε | ASB\nA → a | bA\nB → ε | bBb',
  },
  regex: { a: '(b*a(bb)*)*', b: '|aa*b*', c: '|(b*a)(b*a)*(bb)*' },
  // The five automata of question 2 in words, with example words (checked in the tests). Short lines: read on a phone.
  automata: `a) a*cb*
   q0 –c→ q1
   loops: a in q0, b in q1
   accepting: q1
   accepts: c, aacbb
   rejects: ε, ab, cc

b) (ab)*
   q0 –a→ q1 –b→ q0
   accepting: q0 (= start)
   accepts: ε, ab, abab
   rejects: a, ba, aab

c) (abba)*
   q0 –a→ q1 –b→ q2 –b→ q3 –a→ q0
   accepting: q0 (= start)
   accepts: ε, abba
   rejects: ab, abb, baab

d) a+b+
   q0 –a→ q1 –b→ q2
   loops: a in q1, b in q2
   accepting: q2
   accepts: ab, aabbb
   rejects: ε, a, b, aba

e) (0|1)^8
   q0 –0,1→ q1 –0,1→ ... –0,1→ q8
   accepting: q8 only (exactly 8 symbols)
   accepts: 01100101
   rejects: 0110010, 011001011`,
}
const grammar2026Prompt = ['Consider the following context-free grammars over the alphabet Σ = {a, b}. Determine what kind of language each grammar generates. If the language turns out to be regular, present the corresponding regular expression or finite automaton. If the language is not regular, briefly explain why its recognition exceeds the computational power of a finite automaton.', 'a) S → ε | ABS,  A → a | bA,  B → ε | bBb\nb) S → ε | ASB,  A → a,  B → b | bBb | ε\nc) S → ε | ASB,  A → a | bA,  B → ε | bBb']

const exam2026 = [
  { id: 'bmc-past-2026-1', no: 1, wrap: true, terms: TERMS.np,
    title: '2026 exam, question 1. Integer factorization: in P? In NP?',
    prompt: ['Integer factorization. Let k be a positive integer. The question is to find its factorization: the prime numbers k1, k2, k3, … whose product is k = k1 · k2 · k3 · … (for example 84 = 2 · 2 · 3 · 7).', 'What is the time complexity of solving this problem when the value of k is given? How do you analyze it? Does this problem belong to class P or NP?'],
    answer: [
      'Analyze it like the subset sum problem (exercise 6 task 1): how many possibilities are there to try, and how fast is a proposed answer checked? One thing is new: the input is a number. k is written with n digits (n ≈ log₁₀ k), and the time is measured in n, the length of the input, not in k.',
      code('P  = polynomial time, n^k for a fixed k (e.g. O(n), O(n²))\nNP = nondeterministic polynomial time: a proposed solution can be\n     verified in polynomial time, even if finding it may be hard\nexponential time = O(k^n) with a fixed base k > 1'),
      'Solving: trial division tries the divisors 2, 3, 4, … up to √k (a factor bigger than √k comes with one smaller than √k). √k ≈ 10^(n/2) = (√10)ⁿ ≈ 3.16ⁿ divisions: exponential in n. A 20-digit k needs about 10¹⁰ divisions, a 100-digit k about 10⁵⁰. "√k steps" looks small only because k itself is exponential in the number of its digits, like the O(n·S) of subset sum.',
      'P: not known (as far as is known, no). No polynomial algorithm for factoring is known; the best known algorithms are much faster than trial division but still not polynomial. The security of RSA encryption is based on exactly this.',
      'NP: yes, in the yes/no form "does k have a factor d with 1 < d < m?". Nondeterministically: guess d (n digits), divide k by d and check that the remainder is 0 and d < m: long division of n-digit numbers takes O(n²) steps, polynomial. So a proposed answer is checked in polynomial time → NP. A whole factorization k1 · k2 · … · km is checked the same way: multiply the numbers and compare with k.',
      'Also: factoring is not known to be NP-complete either (it is believed not to be). And deciding only whether k is prime is in P (the AKS algorithm, 2002): finding the factors is the hard part.',
    ] },
  { id: 'bmc-past-2026-2', no: 2, wrap: true, terms: [t('Deterministic finite automaton (DFA)', 'Deterministic_finite_automaton'), t('Regular expression', 'Regular_expression')],
    title: '2026 exam, question 2. Draw the languages as finite automata',
    prompt: ['Draw the following languages as finite automata:', 'a) a*cb*\nb) (ab)*\nc) (abba)*\nd) a+b+\ne) (0|1)^8, an eight-character binary representation (a byte)'],
    answer: [
      'Read each expression from left to right: a star is a loop (or a cycle back to the start), a plus is "at least once" (one arrow, then a loop), and a fixed length is a chain of states. Mark the start state with an arrow and the accepting states with a double circle. Missing arrows reject (or draw one trap state that all of them go to).',
      code(EXAM_2026.automata),
      'Check each automaton with a few words that must be accepted and a few that must not, like the ones under each automaton. The empty word ε is accepted exactly when the start state accepts: in b) and c), not in a), d) and e).',
    ],
    answerDiagrams: [{ label: 'a) a*cb*', text: FA7.a }, { label: 'b) (ab)*', text: FA7.b }, { label: 'c) (abba)*', text: FA7.c }, { label: 'd) a+b+', text: FA7.d }, { label: 'e) (0|1)^8', text: FA7.e }] },
  { id: 'bmc-past-2026-3', no: 3, wrap: true, terms: TERMS.grammar,
    title: '2026 exam, question 3. Regular or not? Three grammars',
    prompt: grammar2026Prompt,
    answer: [
      'The grammars of exercise 5 task 2, with one change: b) has B → b | bBb | ε (in exercise 5 B → b | bBb). Examine derivations: first what each nonterminal produces, then the S-rules.',
      code(`A → a | bA       A = b*a
A → a            A = a
B → ε | bBb      B = (bb)*
B → b | bBb | ε  B = b*
S → ε | ABS      ABAB... = (AB)*
S → ε | ASB      AⁿBⁿ`),
      'b*a is 0...n b\'s and then an a, (bb)* is 0...n times "bb". B → b | bBb | ε gives every number of b\'s: bBb adds a b on both sides, and the middle is b or ε (ε, b, bb, bbb, …). S → ABS adds a new pair AB after the previous ones; S → ASB puts A\'s on the left and as many B\'s on the right (A…A S B…B).',
      'a) A = b*a, B = (bb)* and S → ABS repeats the pair AB: the words have the form (b*a)(bb)*(b*a)(bb)*… Regular:',
      code(`a) ${EXAM_2026.regex.a}`),
      'b) S ⇒ ASB ⇒ AASBB ⇒ AABB: n A\'s and n B\'s. Every A is a, and every B is any number of b\'s, also none. So the word is aⁿ followed by b*b*…b* = b*: the number of b\'s does not depend on n. For example aaa (every B → ε), ab and abbbb (B ⇒ bBb ⇒ bbBbb ⇒ bbbb) are all in the language. Only n = 0 is special: then the word is ε. Regular:',
      code(`b) ε | ${EXAM_2026.regex.b.slice(1)}`),
      'Without the new "| ε" (as in exercise 5: B → b | bBb) every B produces an odd number of b\'s, at least one, so there are at least as many b\'s as a\'s (aⁿbᵐ, m ≥ n). That language is not regular: a finite automaton cannot count the a\'s. The one ε is the whole difference.',
      'c) A = b*a, B = (bb)*, and S → ASB gives n A\'s followed by n B\'s. B can be ε, so (bb)*(bb)*…(bb)* = (bb)*: nothing has to be counted. Only n = 0 is special (ε: a pure b-string like bb needs an A, which ends in a). Regular:',
      code(`c) ε | ${EXAM_2026.regex.c.slice(1)}`),
      'So all three languages are regular. Write the reason (B can be ε, so B…B = B) and an example word for b) and c), so the grader can follow how you got there.',
    ] },
  { id: 'bmc-past-2026-4', no: 4, wrap: true, terms: [t('Finite-state machine', 'Finite-state_machine'), t('Pushdown automaton', 'Pushdown_automaton'), t('Chomsky hierarchy', 'Chomsky_hierarchy')],
    title: '2026 exam, question 4. Which model recognizes each language?',
    prompt: ['Consider the following languages over the alphabet Σ = {0, 1}. Describe in your own words what kinds of strings belong to each language. State what kind of computational model is required to recognize each and why.', 'a) { 0ⁿ1ⁿ | n ≥ 1 }\nb) { (0|1)*10 }\nc) { 0ⁿ0ⁿ | n ∈ N }\nd) { 0ᵖ1ʳ0ᵖ⁻ʳ | p ≥ r }'],
    answer: [
      'Describe the strings with examples, then choose the weakest model that is enough: a finite automaton if only a fixed amount has to be remembered, a pushdown automaton (a stack) if one unbounded count has to be matched, a Turing machine if more than that (like aⁿbⁿcⁿ).',
      code(`a) { 0ⁿ1ⁿ | n ≥ 1 }
   n zeros, then as many ones: 01, 0011, 000111
   PDA: push each 0, pop one 0 for each 1,
   accept when the stack is empty.
   Not a finite automaton: n has no upper limit,
   it would need infinitely many states.

b) { (0|1)*10 }
   strings that end with 10: 10, 0110, 11010
   Finite automaton: it only remembers the last
   two symbols (3 states).

c) { 0ⁿ0ⁿ | n ∈ N }
   0²ⁿ, an even number of zeros: ε, 00, 0000
   Finite automaton with 2 states (even / odd
   so far): (00)*. Both blocks are zeros, so
   nothing has to be compared.

d) { 0ᵖ1ʳ0ᵖ⁻ʳ | p ≥ r }
   p zeros, r ones, p − r zeros: ε, 00, 01, 0010, 000100
   PDA: push each 0 of the first block, pop one
   for each 1 and for each 0 of the last block,
   accept when the stack is empty (r + (p − r) = p).`),
      'This is exercise 5 task 4 exactly. The trap is c): it looks like a), but 0ⁿ0ⁿ is just an even number of zeros.',
    ] },
]

export const pastExams = [
  {
    id: 'final-2026', short: '2026 exam', title: '2026 exam (30.10.2026)', fromMemory: true,
    images: [],
    instructions: '',
    note: 'Written down from memory right after the exam; there is no photo of the paper, and the points are not known. Question 1 is written the way the lecturer writes the exercises (X6 T1). Questions 2–4 are exercise tasks: question 2 is exercise 7 task 4, question 3 is exercise 5 task 2 with one change in b) (B → b | bBb | ε), and question 4 is exercise 5 task 4.',
    questions: exam2026,
  },
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
