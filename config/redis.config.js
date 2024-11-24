'use strict'

/**
 * Config values used to connect to Redis
 * @module RedisConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  disableTls: String(process.env.REDIS_DISABLE_TLS) === 'true' || false
}

module.exports = config
