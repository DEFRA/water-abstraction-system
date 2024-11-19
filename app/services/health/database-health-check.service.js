'use strict'

/**
 * Used by the `DatabaseController` to determine if connection to the database is healthy
 * @module DatabaseHealthCheckService
 */

const { db } = require('../../../db/db.js')

/**
 * Generates an array of stats for each table in the database
 *
 * This is a dump of running `SELECT * FROM pg_stat_user_tables` for the database. It's part of the database
 * health check and we use it for 2 reasons
 *
 * - confirm we can connect
 * - get some basic stats, for example number of records, for each table without needing to connect to the db
 *
 * @returns an array of stats for each table found in the db
 */
async function go () {
  const stats = db.select().table('pg_stat_user_tables')

  return stats
}

module.exports = {
  go
}
