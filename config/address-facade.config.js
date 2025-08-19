'use strict'

/**
 * Config values used to connect to the Address Facade - An Environment Agency built wrapper API for OS Places
 * @module AddressFacadeConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  url: process.env.EA_ADDRESS_FACADE_URL
}

module.exports = config
