'use strict'

/**
 * Fetches details of the pg-boss jobs run by the Import service in the last 24hrs
 * @module FetchImportJobs
 */

const { db } = require('../../../db/db.js')

/**
 * Returns data required to populate the Import tasks of our `/health/info` page.
 *
 * @returns {object} - query response
*/
async function go () {
  const PGBOSS_JOBS_ARRAY = [
    'import.bill-runs',
    'import.charge-versions',
    'import.charging-data',
    'import.tracker',
    'licence-import.delete-removed-documents',
    'licence-import.import-company',
    'licence-import.import-licence',
    'licence-import.import-purpose-condition-types',
    'licence-import.queue-companies',
    'licence-import.queue-licences',
    'nald-import.delete-removed-documents',
    'nald-import.import-licence',
    'nald-import.queue-licences',
    'nald-import.s3-download'
  ]
  const currentDateMinusOneDay = _subtractDaysFromCurrentDate(1)

  return db
    .select('name')
    .count({ completedCount: db.raw("CASE WHEN state = 'completed' THEN 1 END") })
    .count({ failedCount: db.raw("CASE WHEN state = 'failed' THEN 1 END") })
    .count({ activeCount: db.raw("CASE WHEN state IN ('active', 'created') THEN 1 END") })
    .max('completedon as maxCompletedonDate')
    .from(
      (db
        .select(
          'name',
          'state',
          'completedon'
        )
        .from('water_import.job')
        .whereIn('state', ['failed', 'completed', 'active', 'created'])
        .whereIn('name', PGBOSS_JOBS_ARRAY)
        .where((builder) => {
          return builder
            .where('createdon', '>', currentDateMinusOneDay)
            .orWhere('completedon', '>', currentDateMinusOneDay)
        })
        .unionAll(
          db
            .select(
              'name',
              'state',
              'completedon'
            )
            .from('water_import.archive')
            .whereIn('state', ['failed', 'completed', 'active', 'created'])
            .whereIn('name', PGBOSS_JOBS_ARRAY)
            .where((builder) => {
              return builder
                .where('createdon', '>', currentDateMinusOneDay)
                .orWhere('completedon', '>', currentDateMinusOneDay)
            })
        ))
        .as('jobs')
    )
    .groupBy('name')
}

/**
 * Calculates the current date minus the number of days passed to it
 *
 * @param {number} days - The number of days to be deducted from the current date
 *
 * @returns {Date} The current date minus the number days passed to the function
 *
 * @private
 */
function _subtractDaysFromCurrentDate (days) {
  const date = new Date()

  date.setDate(date.getDate() - days)

  return date
}

module.exports = {
  go
}
