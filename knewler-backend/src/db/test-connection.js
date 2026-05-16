'use strict'

require('dotenv').config()
const db = require('./index')

async function test() {
  try {
    await db.query('SELECT 1')
    console.log('Database connected successfully')
    process.exit(0)
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  }
}

test()