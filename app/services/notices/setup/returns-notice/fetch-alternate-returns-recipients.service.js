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
 *
 * @returns {Promise<object[]>} The recipient data for the alternate returns notice
 */
async function go(returnLogIds) {
  const { bindings, query: dueReturnLogsQuery } = GenerateReturnLogsByIdQueryService.go(returnLogIds)
  const query = GenerateRecipientsQueryService.go(NoticeType.ALTERNATE_INVITATION, dueReturnLogsQuery, false)

  const { rows } = await db.raw(query, bindings)

  return rows
}

module.exports = {
  go
}
