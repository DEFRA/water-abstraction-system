'use strict'

/**
 * Fetches recipient data for a returns invitation notice
 * @module FetchStandardReturnsRecipientsService
 */

const GenerateReturnLogsByLicenceQueryService = require('./generate-return-logs-by-licence-query.service.js')
const GenerateReturnLogsByPeriodQueryService = require('./generate-return-logs-by-period-query.service.js')
const GenerateRecipientsQueryService = require('./generate-recipients-query.service.js')
const { futureDueDate } = require('../../../../presenters/notices/base.presenter.js')
const { db } = require('../../../../../db/db.js')
const { transformStringOfLicencesToArray } = require('../../../../lib/general.lib.js')
const { NoticeJourney } = require('../../../../lib/static-lookups.lib.js')

/**
 * Fetches recipient data for a returns invitation notice
 *
 * @param {module:SessionModel} session - The notice setup session instance
 * @param {boolean} download - Whether the data is being fetched for download purposes
 *
 * @returns {Promise<object[]>} The recipient data for the returns invitation notice
 */
async function go(session, download) {
  const { noticeType } = session

  const { bindings, query: dueReturnLogsQuery } = _returnLogsQuery(session)
  const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

  const { rows } = await db.raw(query, bindings)

  _applyNotificationDueDate(rows)

  return rows
}

function _applyNotificationDueDate(rows) {
  for (const row of rows) {
    const { due_date_status: dueDateStatus, latest_due_date: latestDueDate, message_type: messageType } = row

    row.notificationDueDate =
      dueDateStatus === 'all populated' ? latestDueDate : futureDueDate(messageType.toLowerCase())
  }
}

function _returnLogsQuery(session) {
  const { determinedReturnsPeriod: returnsPeriod, journey, licenceRef, noticeType, removeLicences = '' } = session

  if (journey === NoticeJourney.ADHOC) {
    return GenerateReturnLogsByLicenceQueryService.go(licenceRef, noticeType)
  }

  const licencesToExclude = transformStringOfLicencesToArray(removeLicences)

  return GenerateReturnLogsByPeriodQueryService.go(noticeType, licencesToExclude, returnsPeriod)
}

module.exports = {
  go
}
