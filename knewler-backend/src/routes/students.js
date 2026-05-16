'use strict'

const bcrypt = require('bcrypt')
const db = require('../db/index')

module.exports = async function studentsRoutes(fastify) {

  // GET /api/students — all users in the tenant
  fastify.get('/api/students', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user

    const result = await db.query(
      `SELECT id, email, role, first_name, last_name, avatar_url, is_active, created_at
       FROM users
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenant_id]
    )

    return reply.send({ students: result.rows })
  })

  // POST /api/students — create a user in the tenant
  fastify.post('/api/students', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user
    const { first_name, last_name, email, password, role } = request.body

    if (!first_name || !email || !password) {
      return reply.status(400).send({ error: 'First name, email and password are required' })
    }

    const allowed = ['student', 'teacher', 'admin']
    const userRole = allowed.includes(role) ? role : 'student'

    const existing = await db.query(
      'SELECT id FROM users WHERE tenant_id = $1 AND email = $2',
      [tenant_id, email]
    )
    if (existing.rows[0]) {
      return reply.status(409).send({ error: 'A user with this email already exists' })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const result = await db.query(
      `INSERT INTO users (tenant_id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, first_name, last_name, is_active, created_at`,
      [tenant_id, email, password_hash, userRole, first_name, last_name || null]
    )

    return reply.status(201).send({ student: result.rows[0] })
  })

}
