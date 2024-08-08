'use strict'

/**
 * Processes existing return versions to update the their `status` and `endDate` when a new return version is created
 * @module ProcessExistingReturnVersionsService
 */

const { db } = require('../../../db/db.js')

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Processes existing return versions to update the their `status` and `endDate` when a new return version is created
 *
 * Depending on the `startDate` of the new return version that is to be inserted. An existing return version may need
 * its `status` or `endDate` to be updated. An `endDate` may also need to be calculated for the new return version if
 * it is to be inserted between existing return versions, or is superseding an existing one that has an `endDate`.
 *
 * @param {String} licenceId - The UUID of the licence the requirements are for
 * @param {Date} newVersionStartDate - The date that the new return version starts
 *
 * @returns {Promise<Date>} The calculated `endDate` for the new return version if there is one. Null will be returned
 * if there is no `endDate`
 */
async function go (licenceId, newVersionStartDate) {
  const previousVersionEndDate = _previousVersionEndDate(newVersionStartDate)

  let results

  results = await _endLatestVersion(licenceId, newVersionStartDate, previousVersionEndDate)
  if (results.length > 0) {
    return null
  }

  results = await _insertBetweenVersions(licenceId, newVersionStartDate, previousVersionEndDate)
  if (results.length > 0) {
    return results[0].endDate
  }

  results = await _replaceLatestVersion(licenceId, newVersionStartDate)
  if (results.length > 0) {
    return null
  }

  results = await _replacePreviousVersion(licenceId, newVersionStartDate)
  if (results.length > 0) {
    return results[0].endDate
  }

  return null
}

/**
 * Update the end date of the latest return version whose start data is less than the new one and whose end date is null
 *
 * For example, imagine these are the existing return versions
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * The user adds a new return version staring 2024-08-01. The end result would be
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 | 2024-07-31 | current |
 * | 4  | 2022-08-01 |            | current |
 *
 * This function finds return version **3** and updates its end date to the start date of the new return version minus
 * 1 day. We don't care about the end date because the new return version doesn't need one.
 */
async function _endLatestVersion (licenceId, newVersionStartDate, endDate) {
  return ReturnVersionModel.query()
    .patch({ endDate })
    .where('licenceId', licenceId)
    .where('startDate', '<', newVersionStartDate)
    .whereNull('endDate')
    .returning('id')
}

function _previousVersionEndDate (newVersionStartDate) {
  // NOTE: You have to create a new date from newVersionStartDate else when we call setDate we amend the source
  // newVersionStartDate passed to the service.
  const previousVersionEndDate = new Date(newVersionStartDate)

  previousVersionEndDate.setDate(previousVersionEndDate.getDate() - 1)

  return previousVersionEndDate
}

/**
 * Update the end date of a previous version whose start date is less than the new one and whose end date is greater
 *
 * For example, imagine these are the existing return versions
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * The user adds a new return version staring 2021-07-01. The end result would be
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2021-06-30 | current |
 * | 4  | 2021-07-01 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * This function finds return version **2** and updates its end date to the start date of the new return version minus
 * 1 day. We also return the end date from version **2** as this needs to be applied to the new return version. Hence,
 * we are _inserting between versions_.
 *
 * ## A note about the query
 *
 * PostgreSQL has an _awesome_ feature called
 * {@link https://www.postgresql.org/docs/current/dml-returning.html|returning}. This allows you to retrieve values from
 * the rows which were modified by a INSERT, UPDATE OR DELETE command. However, it returns the values _after_ a change
 * has been made. In this scenario we need to know the end date of the return version _before_ we update it.
 *
 * We could have solved this by firing two queries; first SELECT to extract the date, then the update. However, through
 * some SQL magic (hence the need to drop to Knex with some raw sprinkled in) we can use
 * {@link https://www.postgresql.org/docs/current/sql-update.html|FROM}. It is intended to allow you to update one table
 * with values from another. But by referring to return versions twice, it gives us access to the old end date in our
 * `returning` clause even after we've updated it.
 *
 * All credit goes to {@link https://stackoverflow.com/a/7927957/6117745|Erwin Brandstetter} for this.
 *
 * Within the service, we could have ignored the issue of concurrent write load and used Erwin's simpler solution. But
 * when unit testing the speed is such that you encounter it. Hence, we need to lock the row we want to edit which
 * necessitates using a subquery i.e. Erwin's more complex solution.
 */
async function _insertBetweenVersions (licenceId, newVersionStartDate, endDate) {
  const subQuery = db('returnVersions AS rv').withSchema('public')
    .select('rv.id', 'rv.end_date')
    .where('rv.licenceId', licenceId)
    .where('rv.startDate', '<', newVersionStartDate)
    .where('rv.endDate', '>', newVersionStartDate)
    .limit(1)
    .forUpdate() // Lock the selected rows

  return db('returnVersions AS rvx').withSchema('public')
    .update({ endDate })
    .updateFrom(subQuery.as('rvy'))
    .whereRaw('rvx.id = rvy.id')
    .returning(['rvx.id', db.raw('?? as new_end_date', 'rvx.end_date'), 'rvy.endDate'])
}

/**
 * Update the status of a previous version whose start date is equal to the new one and whose end date is null
 *
 * For example, imagine these are the existing return versions
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * The user adds a new return version staring 2022-04-01. The end result would be
 *
 * | Id | Start date | End date   | Status     |
 * |----|------------|------------|------------|
 * | 1  | 2008-04-01 | 2019-05-12 | current    |
 * | 2  | 2019-05-13 | 2022-03-31 | current    |
 * | 3  | 2022-04-01 |            | superseded |
 * | 4  | 2022-04-01 |            | current    |
 *
 * This function finds return version **3** and updates its status to `superseded`. We don't care about the end date
 * because the new return version doesn't need one.
 */
async function _replaceLatestVersion (licenceId, newVersionStartDate) {
  return ReturnVersionModel.query()
    .patch({ status: 'superseded' })
    .where('licenceId', licenceId)
    .where('startDate', newVersionStartDate)
    .whereNull('endDate')
    .returning('id')
}

/**
 * Update the status of a previous version whose start date is equal to the new one and whose end date is not null
 *
 * For example, imagine these are the existing return versions
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * The user adds a new return version staring 2019-05-13. The end result would be
 *
 * | Id | Start date | End date   | Status     |
 * |----|------------|------------|------------|
 * | 1  | 2008-04-01 | 2019-05-12 | current    |
 * | 2  | 2019-05-13 | 2022-03-31 | superseded |
 * | 4  | 2019-05-13 | 2022-03-31 | current    |
 * | 3  | 2022-04-01 |            | current    |
 *
 * This function finds return version **2** and updates its status to `superseded`. We also return the end date from
 * version **2** as this needs to be applied to the new return version as its end date. Hence, we are _replacing a
 * previous version_.
 */
async function _replacePreviousVersion (licenceId, newVersionStartDate) {
  return ReturnVersionModel.query()
    .patch({ status: 'superseded' })
    .where('licenceId', licenceId)
    .where('startDate', newVersionStartDate)
    .whereNotNull('endDate')
    .returning('id', 'endDate')
}

module.exports = {
  go
}
