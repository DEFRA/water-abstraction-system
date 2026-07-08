/**
 * Used to wipe the test database of all tables, views and legacy schemas
 * @module WipeDatabase
 */

import { dbConfig } from './db.js'

import { wipe } from '../test/support/database.js'

/**
 * Wipe the test database of all tables, views and legacy schemas
 *
 * Will only run if NODE_ENV=test as it is only intended to be used to wipe the test DB prior to running migrations.
 *
 * @returns {Promise} the promise returned by `wipe()` (does not resolve to anything)
 */
async function _wipeDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw Error('Will not wipe database unless NODE_ENV is test')
  }

  return wipe()
}

try {
  await _wipeDatabase()

  console.log(`${dbConfig.connection.database} database wiped`)

  process.exit()
} catch (error) {
  console.error(`Could not wipe ${dbConfig.connection.database}: ${error.message}`)

  process.exit(1)
}
