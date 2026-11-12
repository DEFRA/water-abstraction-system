/**
 * Config values used to connect to Redis
 * @module RedisConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

export default {
  disableTls: String(process.env.REDIS_DISABLE_TLS) === 'true' || false,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  port: process.env.REDIS_PORT
}
