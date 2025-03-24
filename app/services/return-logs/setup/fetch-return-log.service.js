'use strict'

/**
 * Fetches return log data needed for the confirm-received view
 * @module FetchConfirmReceivedService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Fetches return log data needed for the confirm-received view
 *
 * @param {string} returnLogId - The UUID of the return log to be fetched
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and licence data
 */
async function go(returnLogId) {
  return await ReturnLogModel.query()
    .findById(returnLogId)
    .select(
      'licence.id AS licenceId',
      'licence.licenceRef',
      'returnLogs.id as returnLogId',
      'returnLogs.returnReference',
      'returnLogs.status',
      'returnLogs.id',
      ref('returnLogs.metadata:purposes').as('purposes'),
      ref('returnLogs.metadata:description').as('siteDescription')
    )
    .innerJoinRelated('licence')
    .where('returnLogs.id', returnLogId)
}

module.exports = {
  go
}
