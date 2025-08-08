'use strict'

/**
 * Fetches the matching return log submission records needed for the reporting page
 * @module FetchReturnLogSubmissionsService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Fetches the matching return log submission records needed for the reporting page
 *
 * @param {string} licenceRef - The licence reference for which to fetch return submissions
 * @param {Date} startDate - The return log startDate for which to fetch return submissions
 * @param {Date} endDate - The return log endDate for which to fetch return submissions
 *
 * @returns {Promise<object>} the matching instance of the `ReturnLogModel` populated with the data needed for the
 * reporting page
 */
async function go(licenceRef, startDate, endDate) {
  const returnLogSubmissions = await _fetchReturnLogSubmissions(licenceRef, startDate, endDate)

  return returnLogSubmissions
}

async function _fetchReturnLogSubmissions(licenceRef, startDate, endDate) {
  return ReturnLogModel.query()
    .select([
      'id',
      'endDate',
      'licenceRef',
      'returnsFrequency',
      'returnReference',
      'startDate',
      ref('metadata:nald.periodStartDay').castText().as('periodStartDay'),
      ref('metadata:nald.periodStartMonth').castText().as('periodStartMonth'),
      ref('metadata:nald.periodEndDay').castText().as('periodEndDay'),
      ref('metadata:nald.periodEndMonth').castText().as('periodEndMonth'),
      ref('metadata:description').castText().as('siteDescription')
    ])
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder
        .select(['nilReturn', 'current'])
        .where('current', true)
        .withGraphFetched('returnSubmissionLines')
        .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
          returnSubmissionLinesBuilder.select(['endDate', 'quantity', 'userUnit'])
        })
    })
    .where('licenceRef', licenceRef)
    .where('startDate', '<=', endDate)
    .where('endDate', '>=', startDate)
}

module.exports = {
  go
}
