'use strict'

/**
 * Fetches the relevant licence version to extract data from for the start date selected by the user
 * @module FetchRelevantLicenceVersionIdService
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
 * This also means we can support someone entering a historic return version prior to when the first licence version
 * starts (possible, because many licences have a start date before their first licence version's start date). We just
 * take our data from that first licence version.
 *
 * @param {string} licenceId - The UUID of the licence we're creating a return version for
 * @param {Date} startDate - The start date the user has selected for the new return version
 *
 * @returns {Promise<module:LicenceVersionModel>} the relevant licence version
 */
async function go(licenceId, startDate) {
  return LicenceVersionModel.query()
    .select(['endDate', 'id', 'startDate'])
    .where('licenceId', licenceId)
    .where((builder) => {
      builder.whereNull('licenceVersions.endDate').orWhere('licenceVersions.endDate', '>=', startDate)
    })
    .orderBy('endDate', 'ASC')
    .limit(1)
    .first()
}

module.exports = {
  go
}
