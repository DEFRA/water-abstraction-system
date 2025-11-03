'use strict'

/**
 * Fetches the returns due for the `/notices/setup/remove-licences` page
 * @module FetchReturnsDueService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const featureFlagsConfig = require('../../../../config/feature-flags.config.js')
const { NoticeType } = require('../../../lib/static-lookups.lib.js')

/**
 * Fetches the returns due for the `/notices/setup/remove-licences` page
 *
 * This function is part of the validation for excluding licences from the list of recipients and download link.
 *
 * The calling function should handle the comparison of matching licences. This service returns any matching licences
 * with those provided (making them a valid licence in the context of 'the licence exists with the given due date).
 *
 * @param {string[]} licenceRefs - the licences to find
 * @param {object} returnsPeriod - containing the 'startDate', 'endDate', 'dueDate' and 'summer'
 * @param {string} noticeType - the notice type
 *
 * @returns {Promise<object[]>}
 */
async function go(licenceRefs, returnsPeriod, noticeType) {
  return _fetch(licenceRefs, returnsPeriod, noticeType)
}

async function _fetch(licenceRefs, returnsPeriod, noticeType) {
  const query = ReturnLogModel.query()
    .select('licenceRef')
    .whereIn('licenceRef', [...licenceRefs])
    .andWhere('status', 'due')
    .andWhere('startDate', '>=', returnsPeriod.startDate)
    .andWhere('endDate', '<=', returnsPeriod.endDate)
    .whereJsonPath('metadata', '$.isSummer', '=', returnsPeriod.summer)
    .distinctOn('licenceRef')

  if (!featureFlagsConfig.enableNullDueDate) {
    query.andWhere('dueDate', returnsPeriod.dueDate)
  } else {
    if (noticeType === NoticeType.REMINDERS) {
      query.whereNotNull('dueDate')
    } else {
      query.whereNull('dueDate')
    }
  }

  return query
}

module.exports = {
  go
}
