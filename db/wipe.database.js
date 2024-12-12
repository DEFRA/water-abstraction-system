'use strict'

/**
 * Used to wipe the test database of all tables, views and legacy schemas
 * @module WipeDatabase
 */

const { dbConfig } = require('./db.js')

const { wipe } = require('../test/support/database.js')

/**
 * Wipe the test database of all tables, views and legacy schemas
 *
 * Will only run if NODE_ENV=test as it is only intended to be used to wipe the test DB prior to running migrations.
 *
 * NOTE: If we don't have a function before the immediately invoked async below Standard JS shouts at us! So, this also
 * handily solves that problem.
 *
 * @returns {Promise} the promise returned by `wipe()` (does not resolve to anything)
 */
async function wipeDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw Error('Will not wipe database unless NODE_ENV is test')
  }

  return wipe()
}

;(async () => {
  await wipeDatabase()

  console.log(`${dbConfig.connection.database} database wiped`)

  process.exit()
})().catch((error) => {
  console.error(`Could not wipe ${dbConfig.connection.database}: ${error.message}`)

  process.exit(1)
})
