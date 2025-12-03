'use strict'

/**
 * Fetches recipient data for a standard returns invitation or reminder notice
 * @module FetchStandardReturnsRecipientsService
 */

const GenerateReturnLogsByPeriodQueryService = require('./generate-return-logs-by-period-query.service.js')
const GenerateRecipientsQueryService = require('./generate-recipients-query.service.js')

const { db } = require('../../../../../db/db.js')
const { transformStringOfLicencesToArray } = require('../../../../lib/general.lib.js')

/**
 * Fetches recipient data for a standard returns invitation or reminder notice
 *
 * @param {module:SessionModel} session - The notice setup session instance
 * @param {boolean} download - Whether the data is being fetched for download purposes
 *
 * @returns {Promise<object[]>} The recipient data for the standard returns notice
 */
async function go(session, download) {
  const { determinedReturnsPeriod: returnsPeriod, noticeType, removeLicences = '' } = session
  const licencesToExclude = transformStringOfLicencesToArray(removeLicences)

  const { bindings, query: dueReturnLogsQuery } = GenerateReturnLogsByPeriodQueryService.go(
    noticeType,
    licencesToExclude,
    returnsPeriod
  )
  const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

  const { rows } = await db.raw(query, bindings)

  return rows
}

module.exports = {
  go
}
