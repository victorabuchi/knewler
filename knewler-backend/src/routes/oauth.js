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
  fastify.get('/api/auth/google', async (request, reply) => {
    const client = getOAuthClient()
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      prompt: 'select_account',
    })
    return reply.redirect(url)
  })

  // GET /api/auth/google/callback — handle Google redirect
  fastify.get('/api/auth/google/callback', async (request, reply) => {
    const { code } = request.query
    const frontendUrl = process.env.FRONTEND_URL || 'https://knewler.com'

    if (!code) {
      return reply.redirect(`${frontendUrl}/login?error=oauth_failed`)
    }

    try {
      const client = getOAuthClient()

      // Exchange code for tokens
      const { tokens } = await client.getToken(code)
      client.setCredentials(tokens)

      // Fetch Google profile
      const oauth2 = google.oauth2({ version: 'v2', auth: client })
      const { data: profile } = await oauth2.userinfo.get()

      const email = profile.email
      const firstName = profile.given_name || profile.name?.split(' ')[0] || ''
      const lastName = profile.family_name || profile.name?.split(' ').slice(1).join(' ') || ''
      const googleId = profile.id

      if (!email) {
        return reply.redirect(`${frontendUrl}/login?error=no_email`)
      }

      let userId, userEmail, userRole, tenantId

      // Check if user already exists
      const existing = await db.query(
        `SELECT users.id, users.email, users.role, users.tenant_id
         FROM users
         JOIN tenants ON users.tenant_id = tenants.id
         WHERE users.email = $1 AND users.is_active = true
         LIMIT 1`,
        [email]
      )

      if (existing.rows[0]) {
        // Existing user — log them in
        const user = existing.rows[0]
        userId = user.id
        userEmail = user.email
        userRole = user.role
        tenantId = user.tenant_id
      } else {
        // New user — create tenant + admin account
        const institutionName = `${profile.name || firstName} Workspace`
        const slug = institutionName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          + '-' + Date.now()

        const tenantResult = await db.query(
          `INSERT INTO tenants (name, slug, type)
           VALUES ($1, $2, 'corporate')
           RETURNING id`,
          [institutionName, slug]
        )
        tenantId = tenantResult.rows[0].id

        const userResult = await db.query(
          `INSERT INTO users (tenant_id, email, password_hash, role, first_name, last_name)
           VALUES ($1, $2, '', 'admin', $3, $4)
           RETURNING id, email, role`,
          [tenantId, email, firstName, lastName]
        )
        userId = userResult.rows[0].id
        userEmail = userResult.rows[0].email
        userRole = userResult.rows[0].role
      }

      const token = fastify.jwt.sign(
        { id: userId, email: userEmail, role: userRole, tenant_id: tenantId },
        { expiresIn: '7d' }
      )

      const userPayload = JSON.stringify({
        id: userId,
        email: userEmail,
        role: userRole,
        first_name: firstName,
        last_name: lastName,
      })

      const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(userPayload)}`
      return reply.redirect(redirectUrl)

    } catch (err) {
      fastify.log.error(err)
      return reply.redirect(`${frontendUrl}/login?error=oauth_failed`)
    }
  })

}
