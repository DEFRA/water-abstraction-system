/**
 * Vitest global setup — runs once in the main process before the full test suite
 * @module GlobalSetup
 */

import Database from './support/database.js'

/**
 * Clean and seed the test database before any tests run
 *
 * When loaded by Vitest via ESM interop, module.exports becomes m.default. Vitest requires the default export to be a
 * function, so we export setup directly rather than wrapping it in an object.
 *
 * @returns {Promise} resolves when the database has been cleaned and seeded
 */
async function setup() {
  await Database.clean()
  await Database.closeConnection()
}

export default setup
