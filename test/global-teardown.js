/**
 * Vitest global teardown — runs once in the main process after the full test suite
 * @module GlobalTeardown
 */

import * as Database from './support/database.js'

/**
 * Closes the database connection after all tests have run
 *
 * @returns {Promise} resolves when the database connection has been closed
 */
export default async function globalTeardown() {
  await Database.closeConnection()
}
