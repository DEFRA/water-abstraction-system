'use strict'

/**
 * Fetches recipient data for a paper returns notice
 * @module FetchPaperReturnsRecipientsService
 */

const GenerateReturnLogsByIdQueryService = require('./generate-return-logs-by-id-query.service.js')
const GenerateRecipientsQueryService = require('./generate-recipients-query.service.js')
const { futureDueDate } = require('../../../../presenters/notices/base.presenter.js')

const { db } = require('../../../../../db/db.js')

/**
 * Fetches recipient data for a paper returns notice
 *
 * @param {module:SessionModel} session - The notice setup session instance
 * @param {boolean} download - Whether the data is being fetched for download purposes
 *
 * @returns {Promise<object[]>} The recipient data for the paper returns notice
 */
async function go(session, download) {
  const { selectedReturns, noticeType } = session

  const { bindings, query: dueReturnLogsQuery } = GenerateReturnLogsByIdQueryService.go(selectedReturns)
  const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

  const { rows } = await db.raw(query, bindings)

  _applyNotificationDueDate(rows, download)

  return rows
}

function _applyNotificationDueDate(rows, download) {
  for (const row of rows) {
    const { due_date: dueDate } = row

    // We can set the notificationDueDate for the download because each row is DISTINCT to a recipient and return log.
    // We can't set it when not downloading because a recipient might be linked to multiple return logs and unlike the
    // other notice types, when we send the notification we create one for each recipient/return log combination. So
    // there is no recipient-level notification date. But that's fine because the /check page only shows the recipient
    // once, and the PaperReturnNotificationsPresenter handles determining the notificationDueDate for each
    // notification.
    if (download) {
      row.notificationDueDate = dueDate ?? futureDueDate('letter')
    } else {
      row.notificationDueDate = null
    }
  }
}

module.exports = {
  go
}
