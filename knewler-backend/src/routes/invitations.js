'use strict'

const crypto = require('crypto')
const bcrypt = require('bcrypt')
const db = require('../db/index')
const { sendInvitationEmail } = require('../services/email')

// Ensure the invitations table exists
async function ensureInvitationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS invitations (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
      email       TEXT NOT NULL,
      first_name  TEXT,
      role        TEXT NOT NULL DEFAULT 'student',
      token       TEXT UNIQUE NOT NULL,
      used        BOOLEAN DEFAULT false,
      expires_at  TIMESTAMPTZ NOT NULL,
      created_by  UUID REFERENCES users(id),
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `)
}

module.exports = async function invitationsRoutes(fastify) {
  await ensureInvitationsTable()

  // ── POST /api/invitations — send invitation (admin only) ─────────────────
  fastify.post('/api/invitations', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id, id: created_by, role: requesterRole } = request.user

    if (requesterRole !== 'admin') {
      return reply.status(403).send({ error: 'Admin access required' })
    }

    const { email, role, first_name } = request.body

    if (!email || !role) {
      return reply.status(400).send({ error: 'Email and role are required' })
    }

    const allowed = ['student', 'teacher', 'admin']
    if (!allowed.includes(role)) {
      return reply.status(400).send({ error: 'Invalid role' })
    }

    // Check user not already in tenant
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
      [email, tenant_id]
    )
    if (existing.rows[0]) {
      return reply.status(409).send({ error: 'A user with this email already exists in your institution' })
    }

    // Check no active (unused, non-expired) invitation already exists
    const pendingCheck = await db.query(
      `SELECT id FROM invitations
       WHERE email = $1 AND tenant_id = $2 AND used = false AND expires_at > now()`,
      [email, tenant_id]
    )
    if (pendingCheck.rows[0]) {
      return reply.status(409).send({ error: 'An active invitation for this email already exists' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const result = await db.query(
      `INSERT INTO invitations (tenant_id, email, first_name, role, token, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, role, token, expires_at, created_at`,
      [tenant_id, email, first_name || null, role, token, expiresAt, created_by]
    )
    const invitation = result.rows[0]

    // Fetch tenant name for the email
    const tenantResult = await db.query('SELECT name FROM tenants WHERE id = $1', [tenant_id])
    const institutionName = tenantResult.rows[0]?.name ?? 'Your institution'

    const frontendUrl = process.env.FRONTEND_URL || 'https://knewler.com'
    const inviteUrl = `${frontendUrl}/join?token=${token}`

    try {
      await sendInvitationEmail({
        to: email,
        first_name: first_name || '',
        institution_name: institutionName,
        role,
        invite_url: inviteUrl,
      })
    } catch (err) {
      fastify.log.error('Failed to send invitation email:', err)
      // Don't fail the request — invitation is saved, email can be resent
    }

    return reply.status(201).send({ invitation })
  })

  // ── GET /api/invitations — list pending invitations (admin only) ──────────
  fastify.get('/api/invitations', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id, role } = request.user

    if (role !== 'admin') {
      return reply.status(403).send({ error: 'Admin access required' })
    }

    const result = await db.query(
      `SELECT id, email, first_name, role, used, expires_at, created_at
       FROM invitations
       WHERE tenant_id = $1 AND used = false AND expires_at > now()
       ORDER BY created_at DESC`,
      [tenant_id]
    )

    return reply.send({ invitations: result.rows })
  })

  // ── DELETE /api/invitations/:id — cancel invitation (admin only) ──────────
  fastify.delete('/api/invitations/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id, role } = request.user

    if (role !== 'admin') {
      return reply.status(403).send({ error: 'Admin access required' })
    }

    const { id } = request.params

    const result = await db.query(
      `DELETE FROM invitations WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [id, tenant_id]
    )

    if (!result.rows[0]) {
      return reply.status(404).send({ error: 'Invitation not found' })
    }

    return reply.send({ success: true })
  })

  // ── GET /api/invitations/verify — public, validate token ─────────────────
  fastify.get('/api/invitations/verify', async (request, reply) => {
    const { token } = request.query

    if (!token) {
      return reply.status(400).send({ error: 'Token is required' })
    }

    const result = await db.query(
      `SELECT inv.id, inv.email, inv.first_name, inv.role, inv.used, inv.expires_at,
              t.name AS institution_name
       FROM invitations inv
       JOIN tenants t ON inv.tenant_id = t.id
       WHERE inv.token = $1`,
      [token]
    )

    const inv = result.rows[0]

    if (!inv) {
      return reply.status(404).send({ error: 'Invitation not found' })
    }
    if (inv.used) {
      return reply.status(410).send({ error: 'This invitation has already been used' })
    }
    if (new Date(inv.expires_at) < new Date()) {
      return reply.status(410).send({ error: 'This invitation has expired' })
    }

    return reply.send({
      invitation: {
        id: inv.id,
        email: inv.email,
        first_name: inv.first_name,
        role: inv.role,
        institution_name: inv.institution_name,
        expires_at: inv.expires_at,
      }
    })
  })

  // ── POST /api/invitations/accept — public, create account from invite ─────
  fastify.post('/api/invitations/accept', async (request, reply) => {
    const { token, first_name, last_name, password } = request.body

    if (!token || !password) {
      return reply.status(400).send({ error: 'Token and password are required' })
    }

    const result = await db.query(
      `SELECT inv.*, t.name AS institution_name, t.slug, t.type, t.plan
       FROM invitations inv
       JOIN tenants t ON inv.tenant_id = t.id
       WHERE inv.token = $1`,
      [token]
    )

    const inv = result.rows[0]

    if (!inv) {
      return reply.status(404).send({ error: 'Invitation not found' })
    }
    if (inv.used) {
      return reply.status(410).send({ error: 'This invitation has already been used' })
    }
    if (new Date(inv.expires_at) < new Date()) {
      return reply.status(410).send({ error: 'This invitation has expired' })
    }

    // Guard: email must not already exist in this tenant
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
      [inv.email, inv.tenant_id]
    )
    if (existingUser.rows[0]) {
      return reply.status(409).send({ error: 'An account with this email already exists' })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const userResult = await db.query(
      `INSERT INTO users (tenant_id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, first_name, last_name`,
      [
        inv.tenant_id,
        inv.email,
        password_hash,
        inv.role,
        first_name || inv.first_name || '',
        last_name || '',
      ]
    )
    const user = userResult.rows[0]

    // Mark invitation used
    await db.query('UPDATE invitations SET used = true WHERE id = $1', [inv.id])

    const tenant = {
      id: inv.tenant_id,
      name: inv.institution_name,
      slug: inv.slug,
      type: inv.type,
      plan: inv.plan,
    }

    const jwtToken = fastify.jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenant_id: inv.tenant_id },
      { expiresIn: '7d' }
    )

    return reply.status(201).send({ token: jwtToken, user, tenant })
  })
}
