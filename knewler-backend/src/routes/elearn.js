'use strict'

const db = require('../db/index')

async function ensureElearnTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS modules (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      tenant_id UUID NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      content_url TEXT,
      content_body TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await db.query(`
    CREATE TABLE IF NOT EXISTS module_completions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
      course_id UUID NOT NULL,
      user_id UUID NOT NULL,
      tenant_id UUID NOT NULL,
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(module_id, user_id)
    )
  `)
  await db.query(`
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      tenant_id UUID NOT NULL,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      submitted_at TIMESTAMPTZ,
      score INTEGER,
      passed BOOLEAN,
      tab_switches INTEGER DEFAULT 0,
      UNIQUE(exam_id, user_id)
    )
  `)
  await db.query(`
    CREATE TABLE IF NOT EXISTS exam_answers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
      question_id UUID NOT NULL,
      answer_text TEXT,
      answer_option INTEGER,
      is_correct BOOLEAN,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(attempt_id, question_id)
    )
  `)
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

module.exports = async function elearnRoutes(fastify) {
  await ensureElearnTables()

  // GET /api/elearn/courses — courses the student is enrolled in with progress
  fastify.get('/api/elearn/courses', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user

    const result = await db.query(
      `SELECT
         c.id,
         c.title,
         c.description,
         COALESCE(u.first_name || ' ' || u.last_name, '') AS teacher_name,
         COALESCE(e.progress, 0)::int AS progress,
         e.last_accessed_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE e.user_id = $1
         AND e.tenant_id = $2
         AND c.status = 'published'
       ORDER BY e.last_accessed_at DESC NULLS LAST, c.created_at DESC`,
      [user_id, tenant_id]
    )

    return reply.send({ courses: result.rows })
  })

  // GET /api/elearn/schedule — upcoming sessions for the tenant (next 7 days)
  fastify.get('/api/elearn/schedule', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user

    const result = await db.query(
      `SELECT
         s.id,
         s.title,
         s.location,
         s.starts_at,
         s.ends_at,
         c.title AS course_title,
         COALESCE(u.first_name || ' ' || u.last_name, '') AS teacher_name
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN users u ON s.teacher_id = u.id
       WHERE s.tenant_id = $1
         AND s.starts_at >= NOW()
         AND s.starts_at <= NOW() + INTERVAL '7 days'
       ORDER BY s.starts_at ASC
       LIMIT 5`,
      [tenant_id]
    )

    return reply.send({ sessions: result.rows })
  })

  // GET /api/elearn/exams — all exams for enrolled courses with attempt status
  fastify.get('/api/elearn/exams', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user

    const result = await db.query(
      `SELECT
         ex.id,
         ex.title,
         ex.duration_mins,
         ex.pass_score,
         ex.tab_lock,
         ex.starts_at,
         ex.ends_at,
         c.title AS course_title,
         ea.id AS attempt_id,
         ea.submitted_at,
         ea.score,
         ea.passed
       FROM exams ex
       JOIN courses c ON ex.course_id = c.id
       JOIN enrollments e ON e.course_id = c.id
         AND e.user_id = $1
         AND e.tenant_id = $2
       LEFT JOIN exam_attempts ea ON ea.exam_id = ex.id AND ea.user_id = $1
       WHERE ex.tenant_id = $2
       ORDER BY ex.starts_at ASC NULLS LAST, ex.created_at DESC`,
      [user_id, tenant_id]
    )

    return reply.send({ exams: result.rows })
  })

  // GET /api/elearn/exams/:id — exam detail with questions, creates attempt
  fastify.get('/api/elearn/exams/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user
    const { id } = request.params

    // Verify enrollment via course
    const examCheck = await db.query(
      `SELECT ex.id, ex.title, ex.duration_mins, ex.pass_score, ex.shuffle, ex.tab_lock,
              ex.starts_at, ex.ends_at, c.title AS course_title
       FROM exams ex
       JOIN courses c ON ex.course_id = c.id
       JOIN enrollments en ON en.course_id = c.id AND en.user_id = $2 AND en.tenant_id = $3
       WHERE ex.id = $1 AND ex.tenant_id = $3`,
      [id, user_id, tenant_id]
    )
    if (!examCheck.rows[0]) {
      return reply.status(403).send({ error: 'Exam not found or not available to you' })
    }
    const exam = examCheck.rows[0]

    // Create or retrieve attempt
    const attemptResult = await db.query(
      `INSERT INTO exam_attempts (exam_id, user_id, tenant_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (exam_id, user_id) DO UPDATE SET exam_id = EXCLUDED.exam_id
       RETURNING id, started_at, submitted_at, score, passed`,
      [id, user_id, tenant_id]
    )
    const attempt = attemptResult.rows[0]
    const alreadySubmitted = attempt.submitted_at !== null

    // Fetch questions
    const questionsResult = await db.query(
      `SELECT id, type, body, options, points, position
       FROM questions
       WHERE exam_id = $1 AND tenant_id = $2
       ORDER BY position ASC, id ASC`,
      [id, tenant_id]
    )

    let questions = questionsResult.rows
    if (exam.shuffle && !alreadySubmitted) {
      questions = shuffleArray(questions)
    }

    // Strip correct flags from options unless already submitted
    questions = questions.map(q => ({
      ...q,
      options: q.options
        ? q.options.map(o => alreadySubmitted ? o : { text: o.text })
        : null
    }))

    // If already submitted, also fetch their answers for review
    let answers = {}
    if (alreadySubmitted) {
      const answersResult = await db.query(
        `SELECT question_id, answer_text, answer_option, is_correct
         FROM exam_answers WHERE attempt_id = $1`,
        [attempt.id]
      )
      for (const row of answersResult.rows) {
        answers[row.question_id] = {
          answer_text: row.answer_text,
          answer_option: row.answer_option,
          is_correct: row.is_correct,
        }
      }
    }

    return reply.send({ exam, questions, attempt, answers })
  })

  // GET /api/elearn/courses/:id — course detail with modules for an enrolled student
  fastify.get('/api/elearn/courses/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user
    const { id } = request.params

    const enrollCheck = await db.query(
      `SELECT e.progress, e.last_accessed_at
       FROM enrollments e
       WHERE e.course_id = $1 AND e.user_id = $2 AND e.tenant_id = $3`,
      [id, user_id, tenant_id]
    )
    if (!enrollCheck.rows[0]) {
      return reply.status(403).send({ error: 'You are not enrolled in this course' })
    }

    const courseResult = await db.query(
      `SELECT
         c.id, c.title, c.description, c.status,
         COALESCE(u.first_name || ' ' || u.last_name, '') AS teacher_name
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [id, tenant_id]
    )
    if (!courseResult.rows[0]) {
      return reply.status(404).send({ error: 'Course not found' })
    }

    const modulesResult = await db.query(
      `SELECT
         m.id, m.title, m.type, m.content_url, m.content_body, m.position,
         (mc.id IS NOT NULL) AS completed
       FROM modules m
       LEFT JOIN module_completions mc ON mc.module_id = m.id AND mc.user_id = $2
       WHERE m.course_id = $1 AND m.tenant_id = $3
       ORDER BY m.position ASC, m.created_at ASC`,
      [id, user_id, tenant_id]
    )

    await db.query(
      `UPDATE enrollments SET last_accessed_at = NOW() WHERE course_id = $1 AND user_id = $2`,
      [id, user_id]
    )

    return reply.send({
      course: {
        ...courseResult.rows[0],
        progress: enrollCheck.rows[0].progress ?? 0,
        last_accessed_at: enrollCheck.rows[0].last_accessed_at,
        modules: modulesResult.rows,
      }
    })
  })

  // POST /api/elearn/courses/:id/progress — manual progress update
  fastify.post('/api/elearn/courses/:id/progress', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user
    const { id } = request.params
    const { progress } = request.body

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return reply.status(400).send({ error: 'Progress must be a number between 0 and 100' })
    }

    const result = await db.query(
      `UPDATE enrollments SET progress = $1, last_accessed_at = NOW()
       WHERE course_id = $2 AND user_id = $3 AND tenant_id = $4
       RETURNING progress`,
      [Math.round(progress), id, user_id, tenant_id]
    )
    if (!result.rows[0]) {
      return reply.status(403).send({ error: 'Not enrolled in this course' })
    }

    return reply.send({ progress: result.rows[0].progress })
  })

  // POST /api/elearn/courses/:id/modules/:moduleId/complete — mark a module as complete
  fastify.post('/api/elearn/courses/:id/modules/:moduleId/complete', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user
    const { id, moduleId } = request.params

    const enrollCheck = await db.query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2 AND tenant_id = $3',
      [id, user_id, tenant_id]
    )
    if (!enrollCheck.rows[0]) {
      return reply.status(403).send({ error: 'Not enrolled in this course' })
    }

    const modCheck = await db.query(
      'SELECT id FROM modules WHERE id = $1 AND course_id = $2 AND tenant_id = $3',
      [moduleId, id, tenant_id]
    )
    if (!modCheck.rows[0]) {
      return reply.status(404).send({ error: 'Module not found' })
    }

    await db.query(
      `INSERT INTO module_completions (module_id, course_id, user_id, tenant_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (module_id, user_id) DO NOTHING`,
      [moduleId, id, user_id, tenant_id]
    )

    const progressResult = await db.query(
      `SELECT COUNT(m.id) AS total, COUNT(mc.id) AS completed
       FROM modules m
       LEFT JOIN module_completions mc ON mc.module_id = m.id AND mc.user_id = $2
       WHERE m.course_id = $1 AND m.tenant_id = $3`,
      [id, user_id, tenant_id]
    )

    const total = Number(progressResult.rows[0].total)
    const completed = Number(progressResult.rows[0].completed)
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    await db.query(
      `UPDATE enrollments SET progress = $1, last_accessed_at = NOW() WHERE course_id = $2 AND user_id = $3`,
      [progress, id, user_id]
    )

    return reply.send({ progress })
  })

  // POST /api/elearn/exams/:id/submit — grade and finalise exam attempt
  fastify.post('/api/elearn/exams/:id/submit', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user
    const { id } = request.params
    const { answers = {}, tab_switches = 0 } = request.body

    // Get attempt
    const attemptResult = await db.query(
      'SELECT id, submitted_at FROM exam_attempts WHERE exam_id = $1 AND user_id = $2',
      [id, user_id]
    )
    if (!attemptResult.rows[0]) {
      return reply.status(400).send({ error: 'No active attempt found. Please start the exam first.' })
    }
    const attempt = attemptResult.rows[0]
    if (attempt.submitted_at) {
      return reply.status(400).send({ error: 'Exam already submitted' })
    }

    // Get exam pass_score
    const examResult = await db.query(
      'SELECT pass_score FROM exams WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id]
    )
    if (!examResult.rows[0]) {
      return reply.status(404).send({ error: 'Exam not found' })
    }
    const { pass_score } = examResult.rows[0]

    // Get questions with full options (including correct flags)
    const questionsResult = await db.query(
      'SELECT id, type, options, points FROM questions WHERE exam_id = $1 AND tenant_id = $2',
      [id, tenant_id]
    )

    let totalPoints = 0
    let earnedPoints = 0
    const results = []

    for (const q of questionsResult.rows) {
      totalPoints += q.points
      const answer = answers[q.id]
      let is_correct = null
      let correct_option = null
      let points_earned = 0

      if (q.type === 'mcq' || q.type === 'true_false') {
        if (Array.isArray(q.options)) {
          correct_option = q.options.findIndex(o => o.correct === true)
          if (answer !== undefined && answer !== null) {
            is_correct = Number(answer) === correct_option
            if (is_correct) {
              points_earned = q.points
              earnedPoints += q.points
            }
          }
        }
      }

      results.push({ question_id: q.id, is_correct, correct_option, answer_given: answer ?? null, points_earned })

      await db.query(
        `INSERT INTO exam_answers (attempt_id, question_id, answer_text, answer_option, is_correct)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (attempt_id, question_id) DO UPDATE
           SET answer_text = EXCLUDED.answer_text,
               answer_option = EXCLUDED.answer_option,
               is_correct = EXCLUDED.is_correct`,
        [
          attempt.id,
          q.id,
          (q.type === 'essay' || q.type === 'file_upload') ? (answer ?? null) : null,
          (q.type === 'mcq' || q.type === 'true_false') ? (answer !== undefined && answer !== null ? Number(answer) : null) : null,
          is_correct,
        ]
      )
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = score >= pass_score

    await db.query(
      `UPDATE exam_attempts SET submitted_at = NOW(), score = $1, passed = $2, tab_switches = $3
       WHERE id = $4`,
      [score, passed, tab_switches, attempt.id]
    )

    return reply.send({ score, passed, results })
  })

}
