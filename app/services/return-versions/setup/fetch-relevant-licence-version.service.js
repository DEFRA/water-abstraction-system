'use strict'

/**
 * Fetches the relevant licence version to extract data from for the start date selected by the user
 * @module FetchRelevantLicenceVersionService
 */

const LicenceVersionModel = require('../../../models/licence-version.model.js')

/**
 * Fetches the relevant licence version to extract data from for the start date selected by the user
 *
 * We need to look for the 'relevant' licence version for the start date the user has entered. That will then give us
 * the correct data for that time, such as purposes and points, we need to use to create the new return version.
 *
 * We find the 'relevant' licence version for the start date the user has entered, by filtering for those where the end
 * date is null or greater than the start date, then sorting them in ascending order (oldest at the top).
 *
 * If a licence only has one 'current' licence version (it will have a null end date) then it will be the one selected.
 *
 * If it has a superseded licence version, but the start date is greater than its end date, we still just get the
 * 'current' version returned.
 *
 * Else the first licence version with an end date equal to or greater than our start date is the version that will be
 * used.
 *
 * > Check out `_manageSameStartDate()` for the exception to this!
 *
 * This also means we can support someone entering a historic return version prior to when the first licence version
 * starts (possible, because many licences have a start date before their first licence version's start date). We just
 * take our data from that first licence version.
 *
 * ## The same start date problem
 *
 *
 *
 * > We're demonstrating one that is superseded and one that current. But both could be superseded with end dates
 *
 * @param {string} licenceId - The UUID of the licence we're creating a return version for
 * @param {Date} startDate - The start date the user has selected for the new return version
 *
 * @returns {Promise<module:LicenceVersionModel>} the relevant licence version
 */
async function go(licenceId, startDate) {
  const licenceVersions = await _fetch(licenceId, startDate)

  if (licenceVersions.length === 0) {
    return null
  }

  if (licenceVersions.length === 1) {
    return licenceVersions[0]
  }

  return _manageSameStartDate(licenceVersions)
}

async function _fetch(licenceId, startDate) {
  return LicenceVersionModel.query()
    .select(['endDate', 'id', 'startDate'])
    .where('licenceId', licenceId)
    .where((builder) => {
      builder.whereNull('licenceVersions.endDate').orWhere('licenceVersions.endDate', '>=', startDate)
    })
    .orderBy([
      { column: 'endDate', order: 'asc' },
      { column: 'issue', order: 'desc' },
      { column: 'increment', order: 'desc' }
    ])
}

/**
 * The same start date problem
 *
 * We have encountered licences that have two licence versions with the same start date. When this is the case, the
 * earliest would have been setup wrong in NALD, so the users have created a second that starts the same day.
 *
 * Because we don't know where they will come in the history, or just how many times a user my have tried to correct
 * their error (!!) we fetch all licence versions.
 *
 * We grab the start date of the first record and then test if there are any others. If there aren't, great! We can just
 * return that first result.
 *
 * If there are more than one with the same start date, we have to dig a bit deeper. :-(
 *
 * ### Both superseded
 *
 * |Issue|Increment|Start date|End data  |Status    |
 * |-----|---------|----------|----------|----------|
 * |100  |0        |2025-04-01|2025-04-01|superseded|
 * |101  |0        |2025-04-01|2025-06-30|superseded|
 *
 * In this example, both licence versions are superseded, so both have an end date. If the selected start date is
 * _after_ 2024-04-01, then issue 100 would not be in the results, and we'll use issue 101 as the first record.
 *
 * However, if the selected start date is 2025-04-01, both would be returned because the filter is 'end date >= selected
 * start date'.
 *
 * Our results are sorted by end date in ascending order, which means issue 100 will be the first result. But as it is
 * replaced by issue 101, that's the 'relevant' licence version we want to return. In this case, we return the last
 * record of those with the same date.
 *
 * ### One current, one superseded
 *
 * |Issue|Increment|Start date|End data  |Status    |
 * |-----|---------|----------|----------|----------|
 * |100  |0        |2025-04-01|2025-04-01|superseded|
 * |101  |0        |2025-04-01|          |current   |
 *
 * In this example, we have a current licence version and a superseded one. Again, if the selected start date is _after_
 * 2024-04-01, then * issue 100 would not be in the results, and we'll take issue 101 as the first record.
 *
 * However, if the selected start date is 2025-04-01, both would be returned.
 *
 * When you sort in ascending order, null values come last. So again, the record we want to return is now the last one,
 * not the first.
 *
 * @private
 */
function _manageSameStartDate(licenceVersions) {
  const firstStartDateTime = licenceVersions[0].startDate.getTime()

  const withSameStartDate = licenceVersions.filter((licenceVersion) => {
    return licenceVersion.startDate.getTime() === firstStartDateTime
  })

  if (withSameStartDate.length === 1) {
    return licenceVersions[0]
  }

  return withSameStartDate[withSameStartDate.length - 1]
}

module.exports = {
  go
}
