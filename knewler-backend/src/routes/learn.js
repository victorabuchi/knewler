'use strict'

const db = require('../db/index')

module.exports = async function learnRoutes(fastify) {

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

  // GET /api/learn/exams — upcoming exams for the student's enrolled courses
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

  // GET /api/learn/courses/:id — course detail for an enrolled student
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

    const course = {
      ...courseResult.rows[0],
      progress: enrollCheck.rows[0].progress ?? 0,
      last_accessed_at: enrollCheck.rows[0].last_accessed_at,
      modules: [],
    }

    return reply.send({ course })
  })

}
