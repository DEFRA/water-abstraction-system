'use strict'

/**
 * Vitest global teardown — runs once in the main process after the full test suite
 * @module GlobalTeardown
 */

const Database = require('./support/database.js')

/**
 * Vitest global teardown — runs once in the main process after the full test suite
 *
 * When loaded by Vitest via ESM interop, module.exports becomes m.default. Vitest requires the default export to be a
 * function, so we export teardown directly rather than wrapping it in an object.
 *
 * @returns {Promise} resolves when the database connection has been closed
 */
async function teardown() {
  await Database.closeConnection()
}

module.exports = teardown
