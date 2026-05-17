'use strict'

const { google } = require('googleapis')
const db = require('../db/index')

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    (process.env.BACKEND_URL || 'https://knewler-backend.onrender.com') + '/api/auth/google/callback'
  )
}

module.exports = async function oauthRoutes(fastify) {

  // GET /api/auth/google — redirect to Google consent screen
  // Optional query param: intent=login|register
  fastify.get('/api/auth/google', async (request, reply) => {
    const intent = request.query.intent === 'register' ? 'register' : 'login'
    const client = getOAuthClient()
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      prompt: 'select_account',
      state: intent,
    })
    return reply.redirect(url)
  })

  // GET /api/auth/google/callback — handle Google redirect
  fastify.get('/api/auth/google/callback', async (request, reply) => {
    const { code, state } = request.query
    const frontendUrl = process.env.FRONTEND_URL || 'https://knewler.com'
    const intent = state === 'register' ? 'register' : 'login'

    if (!code) {
      return reply.redirect(`${frontendUrl}/login?error=oauth_failed`)
    }

    try {
      const client = getOAuthClient()
      const { tokens } = await client.getToken(code)
      client.setCredentials(tokens)

      const oauth2 = google.oauth2({ version: 'v2', auth: client })
      const { data: profile } = await oauth2.userinfo.get()

      const email = profile.email
      const firstName = profile.given_name || profile.name?.split(' ')[0] || ''
      const lastName = profile.family_name || profile.name?.split(' ').slice(1).join(' ') || ''

      if (!email) {
        return reply.redirect(`${frontendUrl}/login?error=no_email`)
      }

      // Look up existing user by email
      const existing = await db.query(
        `SELECT users.id, users.email, users.role, users.tenant_id,
                users.first_name, users.last_name, users.google_id
         FROM users
         JOIN tenants ON users.tenant_id = tenants.id
         WHERE users.email = $1 AND users.is_active = true
         LIMIT 1`,
        [email]
      )

      if (intent === 'login') {
        // Login intent: user must already exist (matched by email)
        if (!existing.rows[0]) {
          return reply.redirect(`${frontendUrl}/login?error=no_account`)
        }
        // Backfill google_id if the account was created manually
        if (!existing.rows[0].google_id && profile.sub) {
          await db.query(
            'UPDATE users SET google_id = $1 WHERE id = $2',
            [profile.sub, existing.rows[0].id]
          )
        }
        return issueSessionAndRedirect({ fastify, reply, frontendUrl, user: existing.rows[0] })
      }

      // Register intent
      if (existing.rows[0]) {
        // Already has an account — just log them in
        return issueSessionAndRedirect({ fastify, reply, frontendUrl, user: existing.rows[0] })
      }

      // New user — send to /register/complete to fill in institution details
      // Issue a short-lived google_token so the complete page can prove Google identity
      const googleToken = fastify.jwt.sign(
        { email, first_name: firstName, last_name: lastName, purpose: 'oauth_register' },
        { expiresIn: '15m' }
      )

      const redirectUrl = `${frontendUrl}/register/complete` +
        `?google_token=${encodeURIComponent(googleToken)}` +
        `&email=${encodeURIComponent(email)}` +
        `&first_name=${encodeURIComponent(firstName)}` +
        `&last_name=${encodeURIComponent(lastName)}`

      return reply.redirect(redirectUrl)

    } catch (err) {
      fastify.log.error(err)
      return reply.redirect(`${frontendUrl}/login?error=oauth_failed`)
    }
  })

  // POST /api/auth/register/google — complete OAuth registration
  fastify.post('/api/auth/register/google', async (request, reply) => {
    const { google_token, institution_name, type, first_name, last_name, email } = request.body

    if (!google_token || !institution_name || !type || !email) {
      return reply.status(400).send({ error: 'All fields are required' })
    }

    // Verify the short-lived google_token
    let payload
    try {
      payload = fastify.jwt.verify(google_token)
    } catch {
      return reply.status(401).send({ error: 'Google token expired or invalid. Please sign in with Google again.' })
    }

    if (payload.purpose !== 'oauth_register' || payload.email !== email) {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    // Guard: user must not already exist
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email]
    )
    if (existing.rows[0]) {
      return reply.status(409).send({ error: 'An account with this email already exists. Please sign in.' })
    }

    // Generate slug
    const slug = institution_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const slugCheck = await db.query('SELECT id FROM tenants WHERE slug = $1', [slug])
    if (slugCheck.rows[0]) {
      return reply.status(409).send({ error: 'An institution with this name already exists. Please choose a different name.' })
    }

    const tenantResult = await db.query(
      `INSERT INTO tenants (name, slug, type)
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, type, plan`,
      [institution_name, slug, type]
    )
    const tenant = tenantResult.rows[0]

    const userResult = await db.query(
      `INSERT INTO users (tenant_id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, '', 'admin', $3, $4)
       RETURNING id, email, role, first_name, last_name`,
      [tenant.id, email, first_name || payload.first_name, last_name || payload.last_name]
    )
    const user = userResult.rows[0]

    const token = fastify.jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenant_id: tenant.id },
      { expiresIn: '7d' }
    )

    return reply.status(201).send({ token, user, tenant })
  })

}

// Helper: sign a session JWT and redirect to /auth/callback
function issueSessionAndRedirect({ fastify, reply, frontendUrl, user }) {
  const token = fastify.jwt.sign(
    { id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id },
    { expiresIn: '7d' }
  )

  const userPayload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
  })

  const redirectUrl = `${frontendUrl}/auth/callback` +
    `?token=${encodeURIComponent(token)}` +
    `&user=${encodeURIComponent(userPayload)}`

  return reply.redirect(redirectUrl)
}
