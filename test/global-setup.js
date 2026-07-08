/**
 * Vitest global setup — runs once in the main process before the full test suite
 * @module GlobalSetup
 */

import * as Database from './support/database.js'

/**
 * Clean and seed the test database before any tests run
 *
 * @returns {Promise} resolves when the database has been cleaned and seeded
 */
export default async function setup() {
  await Database.clean()
  await Database.closeConnection()
}
