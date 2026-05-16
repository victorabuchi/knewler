'use strict'

const db = require('../db/index')

module.exports = async function certificatesRoutes(fastify) {

  // GET /api/certificates — all certificates for the tenant
  fastify.get('/api/certificates', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user

    const result = await db.query(
      `SELECT
         cert.id,
         cert.issued_at,
         cert.cert_url,
         cert.verify_code,
         COALESCE(u.first_name || ' ' || u.last_name, u.email) AS student_name,
         c.title AS course_title
       FROM certificates cert
       JOIN users u ON cert.user_id = u.id
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.tenant_id = $1
       ORDER BY cert.issued_at DESC`,
      [tenant_id]
    )

    return reply.send({ certificates: result.rows })
  })

  // POST /api/certificates — manually issue a certificate
  fastify.post('/api/certificates', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user
    const { user_id, course_id } = request.body

    if (!user_id || !course_id) {
      return reply.status(400).send({ error: 'user_id and course_id are required' })
    }

    // Verify user and course belong to this tenant
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
      [user_id, tenant_id]
    )
    if (!userCheck.rows[0]) {
      return reply.status(404).send({ error: 'Student not found' })
    }

    const courseCheck = await db.query(
      'SELECT id FROM courses WHERE id = $1 AND tenant_id = $2',
      [course_id, tenant_id]
    )
    if (!courseCheck.rows[0]) {
      return reply.status(404).send({ error: 'Course not found' })
    }

    // Avoid duplicate certificates
    const existing = await db.query(
      'SELECT id FROM certificates WHERE user_id = $1 AND course_id = $2 AND tenant_id = $3',
      [user_id, course_id, tenant_id]
    )
    if (existing.rows[0]) {
      return reply.status(409).send({ error: 'Certificate already issued for this student and course' })
    }

    const result = await db.query(
      `INSERT INTO certificates (tenant_id, user_id, course_id)
       VALUES ($1, $2, $3)
       RETURNING id, issued_at, cert_url, verify_code`,
      [tenant_id, user_id, course_id]
    )

    return reply.status(201).send({ certificate: result.rows[0] })
  })

}
