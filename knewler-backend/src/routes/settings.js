'use strict'

const dns = require('dns').promises
const db = require('../db/index')

const KNEWLER_CNAME = 'cname.knewler.com'

module.exports = async function settingsRoutes(fastify) {

  // GET /api/settings — return tenant data
  fastify.get('/api/settings', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user

    const result = await db.query(
      `SELECT id, name, slug, type, plan, primary_color, custom_domain, domain_verified, logo_url, created_at
       FROM tenants WHERE id = $1`,
      [tenant_id]
    )

    if (!result.rows[0]) {
      return reply.status(404).send({ error: 'Tenant not found' })
    }

    return reply.send({ tenant: result.rows[0] })
  })

  // PUT /api/settings/general — update name, type, primary_color
  fastify.put('/api/settings/general', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user
    const { name, type, primary_color } = request.body

    if (!name) {
      return reply.status(400).send({ error: 'Institution name is required' })
    }

    const result = await db.query(
      `UPDATE tenants
       SET name = $1, type = COALESCE($2, type), primary_color = COALESCE($3, primary_color)
       WHERE id = $4
       RETURNING id, name, type, primary_color`,
      [name, type || null, primary_color || null, tenant_id]
    )

    return reply.send({ tenant: result.rows[0] })
  })

  // POST /api/settings/domain — save custom domain
  fastify.post('/api/settings/domain', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user
    const { custom_domain } = request.body

    if (!custom_domain) {
      return reply.status(400).send({ error: 'custom_domain is required' })
    }

    // Normalise: strip protocol and trailing slashes
    const domain = custom_domain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '')

    // Check not already taken by another tenant
    const conflict = await db.query(
      'SELECT id FROM tenants WHERE custom_domain = $1 AND id != $2',
      [domain, tenant_id]
    )
    if (conflict.rows[0]) {
      return reply.status(409).send({ error: 'This domain is already in use by another institution' })
    }

    const result = await db.query(
      `UPDATE tenants
       SET custom_domain = $1, domain_verified = false
       WHERE id = $2
       RETURNING custom_domain, domain_verified`,
      [domain, tenant_id]
    )

    return reply.send({ tenant: result.rows[0] })
  })

  // POST /api/settings/domain/verify — DNS CNAME check
  fastify.post('/api/settings/domain/verify', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { tenant_id } = request.user

    const tenantResult = await db.query(
      'SELECT custom_domain FROM tenants WHERE id = $1',
      [tenant_id]
    )
    const tenant = tenantResult.rows[0]

    if (!tenant?.custom_domain) {
      return reply.status(400).send({ error: 'No custom domain configured' })
    }

    let verified = false
    try {
      const cnames = await dns.resolveCname(tenant.custom_domain)
      verified = cnames.some(
        (c) => c.toLowerCase().replace(/\.$/, '') === KNEWLER_CNAME
      )
    } catch {
      // DNS lookup failed — domain not configured or propagating
      verified = false
    }

    await db.query(
      'UPDATE tenants SET domain_verified = $1 WHERE id = $2',
      [verified, tenant_id]
    )

    return reply.send({ verified })
  })

}
