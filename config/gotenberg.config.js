/**
 * Config values used to connect to Gotenberg - A containerized API for HTML to PDF conversion
 * @module GotenbergConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

export default {
  delay: Number.parseInt(process.env.GOTENBERG_DELAY) || 2000,
  timeout: Number.parseInt(process.env.GOTENBERG_TIMEOUT) || 20000,
  url: process.env.GOTENBERG_URL
}
