'use strict'

/**
 * Config values used to connect to the Companies House API
 * @module CompaniesHouseConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  apiKey: process.env.COMPANIES_HOUSE_API_KEY,
  url: 'https://api.companieshouse.gov.uk/'
}

module.exports = config
