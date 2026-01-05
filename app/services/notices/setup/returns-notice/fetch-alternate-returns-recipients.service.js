'use strict'

/**
 * Fetches recipient data for an alternate returns notice
 * @module FetchAlternateReturnsRecipientsService
 */

const GenerateReturnLogsByIdQueryService = require('./generate-return-logs-by-id-query.service.js')
const GenerateRecipientsQueryService = require('./generate-recipients-query.service.js')
const { NoticeType } = require('../../../../lib/static-lookups.lib.js')

const { db } = require('../../../../../db/db.js')

/**
 * Fetches recipient data for an alternate returns notice
 *
 * @param {string[]} returnLogIds - The return log IDs extracted from failed returns invitations to primary users
 * @param {Date} notificationDueDate - The due date to apply to the alternate notifications, taken from the failed
 * notifications
 *
 * @returns {Promise<object[]>} The recipient data for the alternate returns notice
 */
async function go(returnLogIds, notificationDueDate) {
  const { bindings, query: dueReturnLogsQuery } = GenerateReturnLogsByIdQueryService.go(returnLogIds)
  const query = GenerateRecipientsQueryService.go(NoticeType.ALTERNATE_INVITATION, dueReturnLogsQuery, false)

  const { rows } = await db.raw(query, bindings)

  _applyNotificationDueDate(rows, notificationDueDate)

  return rows
}

function _applyNotificationDueDate(rows, notificationDueDate) {
  for (const row of rows) {
    row.notificationDueDate = notificationDueDate
  }
}

module.exports = {
  go
}
