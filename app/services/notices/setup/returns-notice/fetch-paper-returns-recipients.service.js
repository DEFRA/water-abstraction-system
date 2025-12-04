'use strict'

/**
 * Fetches recipient data for a paper returns notice
 * @module FetchPaperReturnsRecipientsService
 */

const GenerateReturnLogsByIdQueryService = require('./generate-return-logs-by-id-query.service.js')
const GenerateRecipientsQueryService = require('./generate-recipients-query.service.js')

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

  return rows
}

module.exports = {
  go
}
