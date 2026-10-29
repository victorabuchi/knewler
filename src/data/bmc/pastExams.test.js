import { describe, expect, it } from 'vitest'
import { countTrees, dfa, groups, language, pdaAccepts, tmRun, words } from '../../test/formal'
import { EXAM_AUTOMATON, EXAM_AUTOMATON_3, EXAM_AUTOMATON_MIN, EXAM_GRAMMARS, EXAM_REGEX, pastExams } from './pastExams'
import { FA7, PDA7, REGEX7, TM_PLUS_ONE, questions as x7 } from './exercise7'
import { questions as x5 } from './exercise5'
import { questions as x6 } from './exercise6'

const re = (r) => new RegExp(`^(?:${r})$`)
const weight = (w, mod) => [...w].reduce((s, c) => s + (c === 'a' ? 1 : 2), 0) % mod === 0
const lengthsWithAcceptedWord = (accepts, maxLen) => {
  const out = []
  for (let n = 0; n <= maxLen; n++) if ([...words(['a', 'b'], n)].some((w) => w.length === n && accepts(w))) out.push(n)
  return out
}

describe('Past exams: question 2 (the automaton)', () => {
  const f = dfa(EXAM_AUTOMATON)
  it('accepts |w|a + 2|w|b ≡ 0 (mod 6): the empty word and some word of every length from 3', () => {
    for (const w of words(['a', 'b'], 8)) expect(f(w), w).toBe(weight(w, 6))
    expect(lengthsWithAcceptedWord(f, 9)).toEqual([0, 3, 4, 5, 6, 7, 8, 9])
    expect(['', 'bbb', 'aabb', 'aaaab', 'aaaaaa'].every(f)).toBe(true)
    expect(['a', 'b', 'aa', 'ab', 'ba', 'bb'].some(f)).toBe(false)
  })

  it('is minimal, with the partition steps written in the answer', () => {
    expect(groups(EXAM_AUTOMATON)).toEqual([['0'], ['1'], ['2'], ['3'], ['4'], ['5']])
    // P1 = {0}, {1,2,3}, {4}, {5}: the a/b-successors of 1, 2, 3 are all non-accepting; 4 and 5 reach 0 differently
    const next = { 1: ['2', '3'], 2: ['3', '4'], 3: ['4', '5'], 4: ['5', '0'], 5: ['0', '1'] }
    const acc = (s) => s === '0'
    const sig = (s) => next[s].map(acc).join()
    expect([1, 2, 3].map(sig)).toEqual(['false,false', 'false,false', 'false,false'])
    expect(sig(4)).not.toBe(sig(5))
  })

  it('with state 3 accepting: mod 3, words of every length except 1, and three states after minimizing', () => {
    const g = dfa(EXAM_AUTOMATON_3)
    for (const w of words(['a', 'b'], 8)) expect(g(w), w).toBe(weight(w, 3))
    expect(lengthsWithAcceptedWord(g, 9)).toEqual([0, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(groups(EXAM_AUTOMATON_3)).toEqual([['0', '3'], ['1', '4'], ['2', '5']])
    const small = dfa(EXAM_AUTOMATON_MIN)
    for (const w of words(['a', 'b'], 8)) expect(small(w), w).toBe(g(w))
  })
})

describe('Past exams: question 3 (which grammar is not regular)', () => {
  it('(a)–(d) are the regular expressions in the answer', () => {
    for (const key of ['a', 'b', 'c', 'd']) {
      const lang = language(EXAM_GRAMMARS[key], 7)
      for (const w of words(['a', 'b'], 7)) expect(lang.has(w), `${key}: ${w}`).toBe(re(EXAM_REGEX[key]).test(w))
    }
    expect(re(EXAM_REGEX.a).test('bb')).toBe(false)
    expect(re(EXAM_REGEX.c).test('bb')).toBe(false) // a b-block needs an A before it
  })

  it('(e) is {ε} ∪ { aⁿbᵐ | n ≥ 1, m ≥ n, m − n even }: at least as many b\'s as a\'s', () => {
    const lang = language(EXAM_GRAMMARS.e, 8)
    for (const w of words(['a', 'b'], 8)) {
      const m = /^(a*)(b*)$/.exec(w)
      const ok = w === '' || (!!m && m[1].length >= 1 && m[2].length >= m[1].length && (m[2].length - m[1].length) % 2 === 0)
      expect(lang.has(w), w).toBe(ok)
    }
  })
})

describe('Exercise 5', () => {
  const grammar = 'S → A\nA → aAc | B\nB → bBc | C\nC → cC | c'
  it('T1: the four words have parse trees, aabbccc does not', () => {
    const lang = language(grammar, 9)
    expect(['aabbccccc', 'bbccc', 'c', 'acc'].every((w) => lang.has(w))).toBe(true)
    expect(lang.has('aabbccc')).toBe(false)
    const leaves = (text) => text.split('\n').map((l) => l.trim().split(' ').pop()).filter((s) => /^[abc]$/.test(s)).join('')
    const trees = x5[0].answer.filter((a) => a.code).map((a) => leaves(a.code))
    expect(trees).toEqual(['aabbccccc', 'bbccc', 'c', 'acc'])
  })

  it('T2: a) is (b*a(bb)*)*, c) is regular: ε | (b*a)(b*a)*(bb)*', () => {
    const a = language('S → ε | ABS\nA → a | bA\nB → ε | bBb', 7)
    const c = language('S → ε | ASB\nA → a | bA\nB → ε | bBb', 7)
    for (const w of words(['a', 'b'], 7)) {
      expect(a.has(w), w).toBe(re('(b*a(bb)*)*').test(w))
      expect(c.has(w), w).toBe(re('|(b*a)(b*a)*(bb)*').test(w))
    }
  })

  it('T3: the grammars match the descriptions (2 = 111, 1 = odd length, 3 = same ends, 4 = equal counts)', () => {
    const g1 = language('S → BA\nA → BBA | ε\nB → 0 | 1', 7)
    const g2 = language('S → A111A\nA → 0A | 1A | ε', 7)
    const g3 = language('S → 0A0 | 1A1\nA → 0A | 1A | ε', 7)
    const g4 = language('S → SS | 0S1 | 1S0 | ε', 6)
    for (const w of words(['0', '1'], 7)) {
      expect(g1.has(w), w).toBe(w.length % 2 === 1)
      expect(g2.has(w), w).toBe(w.includes('111'))
      expect(g3.has(w), w).toBe(w.length >= 2 && w[0] === w.at(-1))
    }
    for (const w of words(['0', '1'], 6)) expect(g4.has(w), w).toBe([...w].filter((c) => c === '0').length * 2 === w.length)
  })

  it('T6: the new grammar has one parse tree for 1+2*3, the old one two', () => {
    const old = 'E → D | (E) | E+E | E-E | E*E | E/E\nD → 1 | 2 | 3'
    const fixed = 'E → T | E+T | E-T\nT → F | T*F | T/F\nF → D | (E)\nD → 1 | 2 | 3'
    expect(countTrees(old, 'E', '1+2*3')).toBe(2)
    expect(countTrees(fixed, 'E', '1+2*3')).toBe(1)
    expect(countTrees(fixed, 'E', '1-2-3')).toBe(1)
    expect(countTrees(fixed, 'E', '3/(1-2)')).toBe(1)
  })
})

describe('Exercise 6', () => {
  it('T2: the table values are 2ⁿ / x / 86 400 days', () => {
    const days = (n, x) => 2 ** n / x / 86400
    expect(days(30, 100)).toBeCloseTo(124.27, 1)
    expect(days(20, 100)).toBeCloseTo(0.121, 3)
    expect(days(50, 1e6)).toBeCloseTo(13031, -1) // the teacher's table says 13.0: corrected in the answer
    expect(days(100, 1e6) / 1.47e19).toBeCloseTo(1, 1)
    expect(x6.find((q) => q.id === 'bmc-x6-2').answer[1].code).toContain(' 30 | 1,073M     | 124.2')
  })

  it('T3: 16, 21 and 24 variables in an hour, a day and a week', () => {
    const maxN = (seconds) => Math.floor(Math.log2(seconds / 0.03))
    expect([maxN(3600), maxN(86400), maxN(604800)]).toEqual([16, 21, 24])
  })
})

describe('Exercise 7', () => {
  const pairs = (w) => [...w].slice(1).filter((c, i) => (c === 'a' && w[i] === 'c') || (c === 'c' && w[i] === 'a')).length
  it('t2: the regular expressions describe the languages', () => {
    for (const w of words(['a', 'b', 'c'], 7)) {
      expect(re(REGEX7.a).test(w), `a ${w}`).toBe(pairs(w) >= 1)
      expect(re(REGEX7.b).test(w), `b ${w}`).toBe(pairs(w) === 0)
      expect(re(REGEX7.c).test(w), `c ${w}`).toBe(pairs(w) === 1)
      const d = [...w].filter((c) => c === 'c').length === 1 && w.length >= 2 && !w.startsWith('aa')
      expect(re(REGEX7.d1).test(w), `d1 ${w}`).toBe(d)
      expect(re(REGEX7.d2).test(w), `d2 ${w}`).toBe(d)
    }
  })

  it('t3: the Turing machine adds 1', () => {
    for (const [inp, out] of [['1101', '1110'], ['000111', '001000'], ['0', '1'], ['1', '10'], ['100', '101'], ['111', '1000'], ['1011', '1100']]) expect(tmRun(TM_PLUS_ONE, inp), inp).toBe(out)
    for (let n = 0; n < 64; n++) expect(tmRun(TM_PLUS_ONE, n.toString(2))).toBe((n + 1).toString(2))
  })

  it('t4: the automata accept the regular expressions', () => {
    const pairsOf = { a: ['a*cb*', ['a', 'b', 'c']], b: ['(ab)*', ['a', 'b']], c: ['(abba)*', ['a', 'b']], d: ['a+b+', ['a', 'b']] }
    for (const [key, [r, sigma]] of Object.entries(pairsOf)) for (const w of words(sigma, 8)) expect(dfa(FA7[key])(w), `${key} ${w}`).toBe(re(r).test(w))
    for (const w of words(['0', '1'], 9)) expect(dfa(FA7.e)(w), w).toBe(w.length === 8)
  })

  it('t5: the pushdown automata accept aⁿb²ⁿ (n > 0) and aⁿbᵐ (m > n > 1)', () => {
    for (const w of words(['a', 'b'], 9)) {
      const m = /^(a*)(b*)$/.exec(w)
      const n = m ? m[1].length : -1
      const k = m ? m[2].length : -1
      expect(pdaAccepts(PDA7.a, w), `a ${w}`).toBe(!!m && n > 0 && k === 2 * n)
      expect(pdaAccepts(PDA7.b, w), `b ${w}`).toBe(!!m && k > n && n > 1)
    }
  })

  it('t6: aabacad and abacada are in F, aaa is ambiguous, S → CS | C fixes it and keeps the language', () => {
    const F = 'S → SS | C\nA → aB\nB → bCd | ε\nC → AD\nD → cC | ε'
    const fixed = 'S → CS | C\nA → aB\nB → bCd | ε\nC → AD\nD → cC | ε'
    const lang = language(F, 7)
    expect(lang.has('aabacad') && lang.has('abacada')).toBe(true)
    expect(countTrees(F, 'S', 'aaa')).toBeGreaterThan(1)
    expect(countTrees(fixed, 'S', 'aaa')).toBe(1)
    const lf = language(fixed, 6)
    const l6 = language(F, 6)
    for (const w of words(['a', 'b', 'c', 'd'], 6)) expect(lf.has(w), w).toBe(l6.has(w))
    expect(x7.find((q) => q.id === 'bmc-x7-6').answer[1].code).toContain('→ aabacad')
  }, 60000)
})

describe('Past exams data', () => {
  it('has the 2025 exam (28 p), the 2024 exam (28 p) and the 2024 re-exam (30 p), with the points adding up', () => {
    expect(pastExams.map((e) => e.title)).toEqual(['2025 exam (14.3.2025)', '2024 exam', '2024 re-exam (3.5.2024)'])
    const ids = pastExams.flatMap((e) => e.questions.map((q) => q.id))
    expect(new Set(ids).size).toBe(ids.length) // the 2025 and 2024 exams share the questions, not the progress
    for (const e of pastExams) expect(e.questions.reduce((s, q) => s + q.points, 0), e.id).toBe(e.points)
    for (const q of pastExams.flatMap((e) => e.questions)) {
      expect(q.original?.length, q.id).toBeGreaterThan(0)
      expect(q.answer.length, q.id).toBeGreaterThan(1)
    }
  })
})
