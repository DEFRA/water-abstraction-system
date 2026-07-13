/**
 * Fetches recipient data for an alternate returns notice
 * @module FetchAlternateReturnsRecipientsService
 */

import GenerateReturnLogsByIdQueryService from './generate-return-logs-by-id-query.service.js'
import GenerateRecipientsQueryService from './generate-recipients-query.service.js'
import { NoticeType } from '../../../../lib/static-lookups.lib.js'

import { db } from '../../../../../db/db.js'

/**
 * Fetches recipient data for an alternate returns notice
 *
 * @param {string[]} returnLogIds - The return log IDs extracted from failed returns invitations to primary users
 * @param {Date} notificationDueDate - The due date to apply to the alternate notifications, taken from the failed
 * notifications
 *
 * @returns {Promise<object[]>} The recipient data for the alternate returns notice
 */
export default async function fetchAlternateReturnsRecipients(returnLogIds, notificationDueDate) {
  const { bindings, query: dueReturnLogsQuery } = GenerateReturnLogsByIdQueryService(returnLogIds)
  const query = GenerateRecipientsQueryService(NoticeType.ALTERNATE_INVITATION, dueReturnLogsQuery, false)

  const { rows } = await db.raw(query, bindings)

  _applyNotificationDueDate(rows, notificationDueDate)

  return rows
}

function _applyNotificationDueDate(rows, notificationDueDate) {
  for (const row of rows) {
    row.notificationDueDate = notificationDueDate
  }
}
