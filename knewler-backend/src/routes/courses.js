'use strict'

const db = require('../db/index')

module.exports = async function coursesRoutes(fastify) {

  // GET /api/courses — all courses for the tenant
  fastify.get('/api/courses', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user

    const result = await db.query(
      `SELECT
         c.id,
         c.title,
         c.description,
         c.status,
         c.created_at,
         COALESCE(u.first_name || ' ' || u.last_name, '') AS teacher_name,
         COUNT(e.id)::int AS student_count
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE c.tenant_id = $1
       GROUP BY c.id, u.first_name, u.last_name
       ORDER BY c.created_at DESC`,
      [tenant_id]
    )

    return reply.send({ courses: result.rows })
  })

  // POST /api/courses — create a new course
  fastify.post('/api/courses', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id, id: teacher_id } = request.user
    const { title, description, status } = request.body

    if (!title) {
      return reply.status(400).send({ error: 'Course title is required' })
    }

    const allowed = ['draft', 'published', 'archived']
    const courseStatus = allowed.includes(status) ? status : 'draft'

    const result = await db.query(
      `INSERT INTO courses (tenant_id, teacher_id, title, description, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, status, created_at`,
      [tenant_id, teacher_id, title, description || null, courseStatus]
    )

    return reply.status(201).send({ course: result.rows[0] })
  })

}
