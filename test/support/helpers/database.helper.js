'use strict'

/**
 * Use to help with cleaning the database between tests
 *
 * It's good practise to ensure the database is in a 'clean' state between tests to avoid any side effects caused by
 * data from one test being present in another.
 * @module DatabaseHelper
 */

const { db } = require('../../../db/db.js')

/**
 * Call to clean the database of all data
 *
 * It works by identifying all the tables in each schema which we use.
 *
 * Once it has that info it creates a query that tells PostgreSQL to TRUNCATE all the tables and restart their
 * identity columns. For example, if a table relies on an incrementing ID the query will reset that to 1.
 */
async function clean () {
  const schemas = ['crm_v2', 'idm', 'public', 'water', 'returns']

  for (const schema of schemas) {
    const tables = await _tableNames(schema)
    await db.raw(`TRUNCATE TABLE ${tables.join(',')} RESTART IDENTITY`)
  }
}

async function _tableNames (schema) {
  const result = await db('pg_tables')
    .select('tablename')
    .where('schemaname', schema)

  return result.map((table) => {
    return `"${schema}".${table.tablename}`
  })
}

module.exports = {
  clean
}
