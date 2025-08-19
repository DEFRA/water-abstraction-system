'use strict'

/**
 * Config values used to connect to Gotenberg - A containerized API for HTML to PDF conversion
 * @module GotenbergConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  url: process.env.GOTENBERG_URL
}

module.exports = config
