'use strict'

/**
 * Config values used to connect to PostgreSQL
 * @module DatabaseConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  testDatabase: process.env.POSTGRES_DB_TEST,
  // Only used when seeding our dev/test user records
  defaultUserPassword: process.env.DEFAULT_USER_PASSWORD
}

module.exports = config
