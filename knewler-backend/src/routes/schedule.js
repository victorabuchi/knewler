'use strict'

const db = require('../db/index')

module.exports = async function scheduleRoutes(fastify) {

  // GET /api/schedule — all sessions for the tenant
  fastify.get('/api/schedule', {
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
         s.recurrence,
         c.title AS course_title,
         COALESCE(u.first_name || ' ' || u.last_name, '') AS teacher_name
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN users u ON s.teacher_id = u.id
       WHERE s.tenant_id = $1
       ORDER BY s.starts_at ASC`,
      [tenant_id]
    )

    return reply.send({ sessions: result.rows })
  })

  // POST /api/schedule — create a session
  fastify.post('/api/schedule', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id, id: teacher_id } = request.user
    const { title, course_id, location, starts_at, ends_at, recurrence } = request.body

    if (!title || !starts_at || !ends_at) {
      return reply.status(400).send({ error: 'Title, start time and end time are required' })
    }

    if (new Date(ends_at) <= new Date(starts_at)) {
      return reply.status(400).send({ error: 'End time must be after start time' })
    }

    const allowed = ['none', 'daily', 'weekly']
    const sessionRecurrence = allowed.includes(recurrence) ? recurrence : 'none'

    const result = await db.query(
      `INSERT INTO schedules (tenant_id, course_id, teacher_id, title, location, starts_at, ends_at, recurrence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, location, starts_at, ends_at, recurrence`,
      [
        tenant_id,
        course_id || null,
        teacher_id,
        title,
        location || null,
        starts_at,
        ends_at,
        sessionRecurrence,
      ]
    )

    return reply.status(201).send({ session: result.rows[0] })
  })

}
