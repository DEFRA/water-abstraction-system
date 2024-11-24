'use strict'

/**
 * Runs the Knex seed process programmatically
 * @module SeedService
 */

const { db } = require('../../../../db/db.js')

/**
 * Triggers the Knex seed process programmatically
 *
 * This is the same as calling `knex seed:run` on the command line. Only we pull in `db.js` because that is our file
 * which sets up Knex with the right config and all our 'tweaks'.
 *
 * In this context you can read `db.seed.run()` as `knex.seed.run()`.
 *
 * See {@link https://knexjs.org/guide/migrations.html#seed-files | Seed files} for more details.
 *
 * Credit to {@link https://stackoverflow.com/a/53169879 | Programmatically run knex seed:run}
 */
async function go() {
  await db.seed.run()
}

module.exports = {
  go
}
