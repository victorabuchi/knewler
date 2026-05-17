'use strict'

const db = require('../db/index')

async function ensureLearnTables() {
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
}

module.exports = async function learnRoutes(fastify) {
  await ensureLearnTables()

  // GET /api/learn/courses — courses the student is enrolled in with progress
  fastify.get('/api/learn/courses', {
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

  // GET /api/learn/schedule — upcoming sessions for the tenant (next 7 days)
  fastify.get('/api/learn/schedule', {
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

  // GET /api/learn/exams — upcoming exams for enrolled courses
  fastify.get('/api/learn/exams', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user

    const result = await db.query(
      `SELECT
         ex.id,
         ex.title,
         ex.duration_mins,
         ex.pass_score,
         ex.starts_at,
         ex.ends_at,
         c.title AS course_title
       FROM exams ex
       JOIN courses c ON ex.course_id = c.id
       JOIN enrollments e ON e.course_id = c.id
         AND e.user_id = $1
         AND e.tenant_id = $2
       WHERE ex.tenant_id = $2
         AND (ex.ends_at IS NULL OR ex.ends_at >= NOW())
       ORDER BY ex.starts_at ASC NULLS LAST, ex.created_at DESC`,
      [user_id, tenant_id]
    )

    return reply.send({ exams: result.rows })
  })

  // GET /api/learn/courses/:id — course detail with modules for an enrolled student
  fastify.get('/api/learn/courses/:id', {
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
         c.id,
         c.title,
         c.description,
         c.status,
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
         m.id,
         m.title,
         m.type,
         m.content_url,
         m.content_body,
         m.position,
         (mc.id IS NOT NULL) AS completed
       FROM modules m
       LEFT JOIN module_completions mc
         ON mc.module_id = m.id AND mc.user_id = $2
       WHERE m.course_id = $1 AND m.tenant_id = $3
       ORDER BY m.position ASC, m.created_at ASC`,
      [id, user_id, tenant_id]
    )

    // Update last_accessed_at on every visit
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

  // POST /api/learn/courses/:id/progress — manual progress update
  fastify.post('/api/learn/courses/:id/progress', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user
    const { id } = request.params
    const { progress } = request.body

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return reply.status(400).send({ error: 'Progress must be a number between 0 and 100' })
    }

    const result = await db.query(
      `UPDATE enrollments
       SET progress = $1, last_accessed_at = NOW()
       WHERE course_id = $2 AND user_id = $3 AND tenant_id = $4
       RETURNING progress`,
      [Math.round(progress), id, user_id, tenant_id]
    )
    if (!result.rows[0]) {
      return reply.status(403).send({ error: 'Not enrolled in this course' })
    }

    return reply.send({ progress: result.rows[0].progress })
  })

  // POST /api/learn/courses/:id/modules/:moduleId/complete — mark a module as complete
  fastify.post('/api/learn/courses/:id/modules/:moduleId/complete', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: user_id, tenant_id } = request.user
    const { id, moduleId } = request.params

    // Verify enrollment
    const enrollCheck = await db.query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2 AND tenant_id = $3',
      [id, user_id, tenant_id]
    )
    if (!enrollCheck.rows[0]) {
      return reply.status(403).send({ error: 'Not enrolled in this course' })
    }

    // Verify module belongs to course and tenant
    const modCheck = await db.query(
      'SELECT id FROM modules WHERE id = $1 AND course_id = $2 AND tenant_id = $3',
      [moduleId, id, tenant_id]
    )
    if (!modCheck.rows[0]) {
      return reply.status(404).send({ error: 'Module not found' })
    }

    // Insert completion — idempotent
    await db.query(
      `INSERT INTO module_completions (module_id, course_id, user_id, tenant_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (module_id, user_id) DO NOTHING`,
      [moduleId, id, user_id, tenant_id]
    )

    // Recalculate course progress as percentage of modules completed
    const progressResult = await db.query(
      `SELECT
         COUNT(m.id) AS total,
         COUNT(mc.id) AS completed
       FROM modules m
       LEFT JOIN module_completions mc
         ON mc.module_id = m.id AND mc.user_id = $2
       WHERE m.course_id = $1 AND m.tenant_id = $3`,
      [id, user_id, tenant_id]
    )

    const total = Number(progressResult.rows[0].total)
    const completed = Number(progressResult.rows[0].completed)
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    await db.query(
      `UPDATE enrollments SET progress = $1, last_accessed_at = NOW()
       WHERE course_id = $2 AND user_id = $3`,
      [progress, id, user_id]
    )

    return reply.send({ progress })
  })

}
