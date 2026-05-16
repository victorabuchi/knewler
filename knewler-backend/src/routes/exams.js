'use strict'

const db = require('../db/index')

module.exports = async function examsRoutes(fastify) {

  // GET /api/exams — all exams for the tenant with course title + question count
  fastify.get('/api/exams', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user

    const result = await db.query(
      `SELECT
         e.id,
         e.title,
         e.duration_mins,
         e.pass_score,
         e.shuffle,
         e.tab_lock,
         e.starts_at,
         e.ends_at,
         e.created_at,
         c.title AS course_title,
         COUNT(q.id)::int AS question_count
       FROM exams e
       LEFT JOIN courses c ON e.course_id = c.id
       LEFT JOIN questions q ON q.exam_id = e.id
       WHERE e.tenant_id = $1
       GROUP BY e.id, c.title
       ORDER BY e.created_at DESC`,
      [tenant_id]
    )

    return reply.send({ exams: result.rows })
  })

  // GET /api/exams/:id — single exam
  fastify.get('/api/exams/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user
    const { id } = request.params

    const result = await db.query(
      `SELECT
         e.id,
         e.title,
         e.duration_mins,
         e.pass_score,
         e.shuffle,
         e.tab_lock,
         e.starts_at,
         e.ends_at,
         c.title AS course_title
       FROM exams e
       LEFT JOIN courses c ON e.course_id = c.id
       WHERE e.id = $1 AND e.tenant_id = $2`,
      [id, tenant_id]
    )

    if (!result.rows[0]) {
      return reply.status(404).send({ error: 'Exam not found' })
    }

    return reply.send({ exam: result.rows[0] })
  })

  // POST /api/exams — create an exam
  fastify.post('/api/exams', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user
    const { title, course_id, duration_mins, pass_score, shuffle, tab_lock, starts_at, ends_at } = request.body

    if (!title || !duration_mins) {
      return reply.status(400).send({ error: 'Title and duration are required' })
    }

    if (duration_mins < 5) {
      return reply.status(400).send({ error: 'Duration must be at least 5 minutes' })
    }

    const result = await db.query(
      `INSERT INTO exams (tenant_id, course_id, title, duration_mins, pass_score, shuffle, tab_lock, starts_at, ends_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, title, duration_mins, pass_score, shuffle, tab_lock, starts_at, ends_at`,
      [
        tenant_id,
        course_id || null,
        title,
        duration_mins,
        pass_score ?? 70,
        shuffle ?? true,
        tab_lock ?? true,
        starts_at || null,
        ends_at || null,
      ]
    )

    return reply.status(201).send({ exam: result.rows[0] })
  })

  // GET /api/exams/:id/questions — all questions for an exam
  fastify.get('/api/exams/:id/questions', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user
    const { id } = request.params

    // Verify exam belongs to tenant
    const examCheck = await db.query(
      'SELECT id FROM exams WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id]
    )
    if (!examCheck.rows[0]) {
      return reply.status(404).send({ error: 'Exam not found' })
    }

    const result = await db.query(
      `SELECT id, type, body, options, points, position
       FROM questions
       WHERE exam_id = $1 AND tenant_id = $2
       ORDER BY position ASC, id ASC`,
      [id, tenant_id]
    )

    return reply.send({ questions: result.rows })
  })

  // POST /api/exams/:id/questions — add a question
  fastify.post('/api/exams/:id/questions', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user
    const { id } = request.params
    const { type, body, points, options } = request.body

    if (!type || !body) {
      return reply.status(400).send({ error: 'Question type and body are required' })
    }

    const allowed = ['mcq', 'essay', 'true_false', 'file_upload']
    if (!allowed.includes(type)) {
      return reply.status(400).send({ error: 'Invalid question type' })
    }

    // Verify exam belongs to tenant
    const examCheck = await db.query(
      'SELECT id FROM exams WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id]
    )
    if (!examCheck.rows[0]) {
      return reply.status(404).send({ error: 'Exam not found' })
    }

    // Next position
    const posResult = await db.query(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM questions WHERE exam_id = $1',
      [id]
    )
    const position = posResult.rows[0].next_pos

    const result = await db.query(
      `INSERT INTO questions (exam_id, tenant_id, type, body, options, points, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, type, body, options, points, position`,
      [
        id,
        tenant_id,
        type,
        body,
        options ? JSON.stringify(options) : null,
        points ?? 1,
        position,
      ]
    )

    return reply.status(201).send({ question: result.rows[0] })
  })

}
