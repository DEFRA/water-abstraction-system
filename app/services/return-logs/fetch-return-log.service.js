'use strict'

/**
 * Fetches the matching return log and associated submission and licence data needed for the view
 * @module FetchReturnVersionService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../../app/models/return-log.model.js')

/**
 * Fetches the matching return log and associated submission and licence data needed for the view
 *
 * @param {string} returnId - The return log ID
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance
 */
async function go(returnId) {
  const returnLog = await _fetch(returnId)

  returnLog.returnSubmissions[0].$applyReadings()

  return returnLog
}

async function _fetch(returnId) {
  return ReturnLogModel.query()
    .findById(returnId)
    .select([
      'id',
      'dueDate',
      'endDate',
      'receivedDate',
      'returnsFrequency',
      'returnReference',
      'startDate',
      'status',
      'underQuery',
      ref('metadata:description').castText().as('siteDescription'),
      ref('metadata:nald.periodStartDay').castInt().as('periodStartDay'),
      ref('metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
      ref('metadata:nald.periodEndDay').castInt().as('periodEndDay'),
      ref('metadata:nald.periodEndMonth').castInt().as('periodEndMonth'),
      ref('metadata:purposes').as('purposes'),
      ref('metadata:isTwoPartTariff').castBool().as('twoPartTariff')
    ])
    .withGraphFetched('licence')
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder.select(['id', 'userId', 'userType', 'version', 'metadata', 'nilReturn', 'createdAt'])
      returnSubmissionsBuilder
        .orderBy('version', 'desc')
        .limit(1)
        .withGraphFetched('returnSubmissionLines')
        .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
          returnSubmissionLinesBuilder
            .select(['id', 'startDate', 'endDate', 'quantity', 'userUnit'])
            .orderBy('startDate', 'asc')
        })
    })
}

module.exports = {
  go
}
