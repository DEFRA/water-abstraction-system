'use strict'

/**
 * Fetches recipient data for an ad-hoc returns invitation or reminder notice
 * @module FetchAdHocReturnsRecipientsService
 */

const GenerateReturnLogsByLicenceQueryService = require('./generate-return-logs-by-licence-query.service.js')
const GenerateRecipientsQueryService = require('./generate-recipients-query.service.js')

const { db } = require('../../../../../db/db.js')

/**
 * Fetches recipient data for an ad-hoc returns invitation or reminder notice
 *
 * @param {module:SessionModel} session - The notice setup session instance
 * @param {boolean} download - Whether the data is being fetched for download purposes
 *
 * @returns {Promise<object[]>} The recipient data for the ad-hoc returns notice
 */
async function go(session, download) {
  const { licenceRef, noticeType } = session

  const { bindings, query: dueReturnLogsQuery } = GenerateReturnLogsByLicenceQueryService.go(licenceRef)
  const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

  const { rows } = await db.raw(query, bindings)

  return rows
}

module.exports = {
  go
}
