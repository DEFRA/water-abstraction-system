'use strict'

/**
 * @module DatabaseHelper
 */

const { db } = require('../../../db/db.js')

/**
 * Use to help with cleaning the database between tests
 *
 * It's good practise to ensure the database is in a 'clean' state between tests to avoid any side effects caused by
 * data from one test being present in another.
 */
class DatabaseHelper {
  /**
   * Call to clean the database of all data
   *
   * It works by identifying all the tables in each schema which we use.
   *
   * Once it has that info it creates a query that tells PostgreSQL to TRUNCATE all the tables and restart their
   * identity columns. For example, if a table relies on an incrementing ID the query will reset that to 1.
   */
  static async clean () {
    const schemas = ['water']

    for (const schema of schemas) {
      const tables = await this._tableNames(schema)
      await db.raw(`TRUNCATE TABLE ${tables.join(',')} RESTART IDENTITY`)
    }
  }

  static async _tableNames (schema) {
    const result = await db('pg_tables')
      .select('tablename')
      .where('schemaname', schema)

    return result.map((table) => `${schema}.${table.tablename}`)
  }
}

module.exports = DatabaseHelper
