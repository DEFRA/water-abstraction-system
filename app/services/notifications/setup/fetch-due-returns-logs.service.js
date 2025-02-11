'use strict'

/**
 * Fetches the due returns logs for the `/notifications/setup/remove-licences` page
 * @module FetchDueReturnsLogsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Fetches the due return logs for the `/notifications/setup/remove-licences` page.
 *
 * This function validates the submitted licences to exclude from the list of recipients and download link.
 * It checks if the provided `licenceRef` is valid. If it's not valid, it will not be returned in the results.
 *
 * @param {string[]} licenceRefs - the licences to find
 * @param {string} dueDate - The 'due' date for outstanding return logs to fetch contacts for
 * @param {string} summer - Whether we are looking for outstanding summer or all year return logs
 *
 * @returns {Promise<object[]>} - Due return log licences matching the provided `licenceRefs`
 */
async function go(licenceRefs, dueDate, summer) {
  return _fetch(licenceRefs, dueDate, summer)
}

async function _fetch(licenceRefs, dueDate, summer) {
  return ReturnLogModel.query()
    .select('licenceRef')
    .whereIn('licenceRef', [...licenceRefs])
    .andWhere('status', 'due')
    .andWhere('dueDate', dueDate)
    .whereJsonPath('metadata', '$.isCurrent', '=', 'true')
    .whereJsonPath('metadata', '$.isSummer', '=', summer)
    .distinctOn('licenceRef')
}

module.exports = {
  go
}
