'use strict'

const bcrypt = require('bcrypt')
const db = require('../db/index')

module.exports = async function authRoutes(fastify) {

  // Register a new tenant + admin user
  fastify.post('/api/auth/register', async (request, reply) => {
    const { institution_name, type, email, password, first_name, last_name } = request.body

    if (!institution_name || !type || !email || !password || !first_name) {
      return reply.status(400).send({ error: 'All fields are required' })
    }

    // Generate slug from institution name
    const slug = institution_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Check slug is not taken
    const existingTenant = await db.query(
      'SELECT id FROM tenants WHERE slug = $1',
      [slug]
    )
    if (existingTenant.rows[0]) {
      return reply.status(409).send({ error: 'An institution with this name already exists' })
    }

    // Create the tenant
    const tenantResult = await db.query(
      `INSERT INTO tenants (name, slug, type)
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, type, plan`,
      [institution_name, slug, type]
    )
    const tenant = tenantResult.rows[0]

    // Check email not already used in this tenant
    const existingUser = await db.query(
      'SELECT id FROM users WHERE tenant_id = $1 AND email = $2',
      [tenant.id, email]
    )
    if (existingUser.rows[0]) {
      return reply.status(409).send({ error: 'This email is already registered' })
    }

    // Hash password and create admin user
    const password_hash = await bcrypt.hash(password, 12)
    const userResult = await db.query(
      `INSERT INTO users (tenant_id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, 'admin', $4, $5)
       RETURNING id, email, role, first_name, last_name`,
      [tenant.id, email, password_hash, first_name, last_name]
    )
    const user = userResult.rows[0]

    const token = fastify.jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenant_id: tenant.id },
      { expiresIn: '7d' }
    )

    return reply.status(201).send({ token, user, tenant })
  })

  // Login
  fastify.post('/api/auth/login', async (request, reply) => {
    const { email, password, slug } = request.body

    if (!email || !password || !slug) {
      return reply.status(400).send({ error: 'Email, password and institution slug are required' })
    }

    // Find tenant by slug
    const tenantResult = await db.query(
      'SELECT id, name, slug, type, plan FROM tenants WHERE slug = $1',
      [slug]
    )
    if (!tenantResult.rows[0]) {
      return reply.status(404).send({ error: 'Institution not found' })
    }
    const tenant = tenantResult.rows[0]

    // Find user
    const userResult = await db.query(
      'SELECT * FROM users WHERE tenant_id = $1 AND email = $2 AND is_active = true',
      [tenant.id, email]
    )
    if (!userResult.rows[0]) {
      return reply.status(401).send({ error: 'Invalid email or password' })
    }
    const user = userResult.rows[0]

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid email or password' })
    }

    const token = fastify.jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenant_id: tenant.id },
      { expiresIn: '7d' }
    )

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      },
      tenant
    })
  })

  // Get current logged in user
  fastify.get('/api/auth/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userResult = await db.query(
      `SELECT id, email, role, first_name, last_name, avatar_url, created_at
       FROM users WHERE id = $1`,
      [request.user.id]
    )
    if (!userResult.rows[0]) {
      return reply.status(404).send({ error: 'User not found' })
    }

    const tenantResult = await db.query(
      'SELECT id, name, slug, type, plan, custom_domain FROM tenants WHERE id = $1',
      [request.user.tenant_id]
    )

    return reply.send({
      user: userResult.rows[0],
      tenant: tenantResult.rows[0]
    })
  })

}