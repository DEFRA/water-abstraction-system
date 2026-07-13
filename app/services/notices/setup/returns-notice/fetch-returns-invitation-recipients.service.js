/**
 * Fetches recipient data for a returns invitation notice
 * @module FetchStandardReturnsRecipientsService
 */

import GenerateReturnLogsByLicenceQueryService from './generate-return-logs-by-licence-query.service.js'
import GenerateReturnLogsByPeriodQueryService from './generate-return-logs-by-period-query.service.js'
import GenerateRecipientsQueryService from './generate-recipients-query.service.js'
import { futureDueDate } from '../../../../presenters/notices/base.presenter.js'
import { db } from '../../../../../db/db.js'
import { transformStringOfLicencesToArray } from '../../../../lib/general.lib.js'
import { NoticeJourney } from '../../../../lib/static-lookups.lib.js'

/**
 * Fetches recipient data for a returns invitation notice
 *
 * @param {module:SessionModel} session - The notice setup session instance
 * @param {boolean} download - Whether the data is being fetched for download purposes
 *
 * @returns {Promise<object[]>} The recipient data for the returns invitation notice
 */
export default async function fetchReturnsInvitationRecipientsService(session, download) {
  const { noticeType } = session

  const { bindings, query: dueReturnLogsQuery } = _returnLogsQuery(session)
  const query = GenerateRecipientsQueryService(noticeType, dueReturnLogsQuery, download)

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
    return GenerateReturnLogsByLicenceQueryService(licenceRef, noticeType)
  }

  const licencesToExclude = transformStringOfLicencesToArray(removeLicences)

  return GenerateReturnLogsByPeriodQueryService(noticeType, licencesToExclude, returnsPeriod)
}
