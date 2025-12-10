'use strict'

/**
 * Fetches the licence refs with due returns for the return period selected to validate those licences to be removed
 * @module FetchLicenceRefsWithDueReturnsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const { NoticeType } = require('../../../lib/static-lookups.lib.js')

/**
 * Fetches the licence refs with due returns for the return period selected to validate those licences to be removed
 *
 * This function is part of the validation for removing licences from the list of recipients for a standard returns
 * invitation or reminder notice.
 *
 * This service returns an array of licence references with due returns in the period selected for the notice. The
 * result is then passed to the validator which will compare it with the licence refs the user has submitted to be
 * removed.
 *
 * If a 'removed' licence ref is in the result of this service, then the licence and its recipients are valid to be
 * removed.
 *
 * Else, the 'removed' licence ref is considered 'invalid' and will flag the error on screen
 * with those provided (making them a valid licence in the context of 'the licence exists with the given due date).
 *
 * @param {object} returnsPeriod - containing the 'startDate', 'endDate', and 'summer'
 * @param {string} noticeType - the notice type, either 'reminders' or 'invitations'
 *
 * @returns {Promise<object[]>} an array of licence references with 'due' returns in the selected period
 */
async function go(returnsPeriod, noticeType) {
  const returnLogs = await _fetch(returnsPeriod, noticeType)

  return returnLogs.map((returnLog) => {
    return returnLog.licenceRef
  })
}

async function _fetch(returnsPeriod, noticeType) {
  const query = ReturnLogModel.query()
    .select('licenceRef')
    .andWhere('status', 'due')
    .andWhere('startDate', '>=', returnsPeriod.startDate)
    .andWhere('endDate', '<=', returnsPeriod.endDate)
    .whereJsonPath('metadata', '$.isCurrent', '=', 'true')
    .whereJsonPath('metadata', '$.isSummer', '=', returnsPeriod.summer)
    .distinctOn('licenceRef')

  if (noticeType === NoticeType.REMINDERS) {
    query.whereNotNull('dueDate')
  } else {
    query.whereNull('dueDate')
  }

  return query
}

module.exports = {
  go
}
