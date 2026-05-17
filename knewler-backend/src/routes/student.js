'use strict'

const db = require('../db')

async function ensureStudentTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id           SERIAL PRIMARY KEY,
      tenant_id    INTEGER NOT NULL,
      sender_id    INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject      TEXT NOT NULL DEFAULT '',
      body         TEXT NOT NULL DEFAULT '',
      read         BOOLEAN NOT NULL DEFAULT FALSE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function studentRoutes(fastify) {
  await ensureStudentTables()

  fastify.get('/api/student/messages', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { tenant_id, id: userId } = request.user
    const result = await db.query(
      `SELECT m.id, m.subject, m.body, m.read, m.created_at,
              u.first_name AS sender_first_name, u.last_name AS sender_last_name
       FROM messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.tenant_id = $1 AND m.recipient_id = $2
       ORDER BY m.created_at DESC
       LIMIT 20`,
      [tenant_id, userId]
    )
    return { messages: result.rows }
  })

  fastify.get('/api/student/profile', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { tenant_id, id: userId } = request.user
    const userResult = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.created_at,
              t.name AS institution_name
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id
       WHERE u.id = $1 AND u.tenant_id = $2`,
      [userId, tenant_id]
    )
    if (!userResult.rows[0]) return reply.status(404).send({ error: 'User not found' })
    return { profile: userResult.rows[0] }
  })
}

module.exports = studentRoutes
