'use strict'

/**
 * Fetches return log data needed for the confirmed view
 * @module FetchReturnLogService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Fetches return log data needed for the confirmed view
 *
 * @param {string} returnId - The UUID of the return log to be fetched
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and licence data
 */
async function go(returnId) {
  return await ReturnLogModel.query()
    .select(
      'licence.id AS licenceId',
      'licence.licenceRef',
      'returnLogs.returnId',
      'returnLogs.returnReference',
      'returnLogs.status',
      ref('returnLogs.metadata:purposes').as('purposes'),
      ref('returnLogs.metadata:description').as('siteDescription'),
      ReturnLogModel.relatedQuery('returnSubmissions').count().as('submissionCount')
    )
    .innerJoinRelated('licence')
    .where('returnLogs.returnId', returnId)
    .first()
}

module.exports = {
  go
}
