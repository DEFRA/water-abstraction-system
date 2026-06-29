'use strict'

/**
 * Vitest global teardown — Close the test database connection after all tests have run
 * @module GlobalTeardown
 */

const Database = require('./support/database.js')

/**
 * Vitest global teardown — Close the test database connection after all tests have run
 */
async function teardown() {
  await Database.closeConnection()
}

module.exports = teardown
