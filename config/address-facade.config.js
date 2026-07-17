/**
 * Config values used to connect to the Address Facade - An Environment Agency built wrapper API for OS Places
 * @module AddressFacadeConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

export default {
  url: process.env.EA_ADDRESS_FACADE_URL
}
