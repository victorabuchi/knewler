'use strict'

require('dotenv').config()

const fastify = require('fastify')({ logger: true })

// Plugins
fastify.register(require('@fastify/cors'), {
  origin: process.env.FRONTEND_URL || 'http://localhost:3004',
  credentials: true
})

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'knewler_dev_secret'
})

// Auth decorator — protects private routes
fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' })
  }
})

// Health check
fastify.get('/health', async (request, reply) => {
  return {
    status: 'Knewler backend is running',
    port: process.env.PORT || 3005,
    time: new Date().toISOString()
  }
})

// Routes
fastify.register(require('./routes/auth'))


// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3005,
      host: '0.0.0.0'
    })
    console.log('Knewler backend running on http://localhost:3005')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()