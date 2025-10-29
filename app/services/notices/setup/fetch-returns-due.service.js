'use strict'

/**
 * Fetches the returns due for the `/notices/setup/remove-licences` page
 * @module FetchReturnsDueService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Fetches the returns due for the `/notices/setup/remove-licences` page
 *
 * This function is part of the validation for excluding licences from the list of recipients and download link.
 *
 * The calling function should handle the comparison of matching licences. This service returns any matching licences
 * with those provided (making them a valid licence in the context of 'the licence exists with the given due date).
 *
 * @param {string[]} licenceRefs - the licences to find
 * @param {string} dueDate - The 'due' date for outstanding return logs to fetch contacts for
 * @param {string} summer - Whether we are looking for outstanding summer or all year return logs
 *
 * @returns {Promise<object[]>}
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
    .whereJsonPath('metadata', '$.isSummer', '=', summer)
    .distinctOn('licenceRef')
}

module.exports = {
  go
}
