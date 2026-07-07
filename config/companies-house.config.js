/**
 * Config values used to connect to the Companies House API
 * @module CompaniesHouseConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

const config = {
  apiKey: process.env.COMPANIES_HOUSE_API_KEY,
  url: 'https://api.companieshouse.gov.uk/'
}

export default config
