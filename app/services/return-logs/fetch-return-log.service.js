'use strict'

/**
 * Fetches the matching return log and associated submission and licence data needed for the view
 * @module FetchReturnVersionService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnSubmissionModel = require('../../models/return-submission.model.js')

/**
 * Fetches the matching return log and associated submission and licence data needed for the view
 *
 * @param {string} returnId - The return log ID
 * @param {number} [version=0] - Optional version number of the submission to display. Defaults to 0 which means
 * 'current'
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and associated submission and
 * licence data
 */
async function go(returnId, version = 0) {
  const allReturnSubmissions = await _fetchAllReturnSubmissions(returnId)

  const returnSubmissionId = _returnSubmissionId(allReturnSubmissions, version)

  const returnLog = await _fetch(returnId, returnSubmissionId)

  returnLog.returnSubmissions[0].$applyReadings()
  returnLog.versions = allReturnSubmissions

  return returnLog
}

async function _fetch(returnId, returnSubmissionId) {
  return ReturnLogModel.query()
    .findById(returnId)
    .select([
      'dueDate',
      'endDate',
      'id',
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
    .modifyGraph('licence', (licenceBuilder) => {
      licenceBuilder.select(['id', 'licenceRef'])
    })
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder
        .findById(returnSubmissionId)
        .select(['createdAt', 'id', 'metadata', 'nilReturn', 'userId', 'userType', 'version'])
        .withGraphFetched('returnSubmissionLines')
        .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
          returnSubmissionLinesBuilder
            .select(['id', 'startDate', 'endDate', 'quantity', 'userUnit'])
            .orderBy('startDate', 'asc')
        })
    })
}

async function _fetchAllReturnSubmissions(returnId) {
  return ReturnSubmissionModel.query()
    .select(['createdAt', 'id', 'version', 'userId'])
    .where('returnLogId', returnId)
    .orderBy('version', 'desc')
}

function _returnSubmissionId(allReturnSubmissions, version) {
  // If version is 0, it means a previous version has not been selected so we want the latest i.e. the 'current' version
  if (version === 0) {
    return allReturnSubmissions[0].id
  }

  const selectedReturnSubmission = allReturnSubmissions.find((returnSubmission) => {
    return returnSubmission.version === version
  })

  return selectedReturnSubmission.id
}

module.exports = {
  go
}
