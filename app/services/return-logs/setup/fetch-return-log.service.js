/**
 * Fetches return log data needed for the confirmed view
 * @module FetchReturnLogService
 */

import { ref } from 'objection'

import ReturnLogModel from '../../../models/return-log.model.js'

/**
 * Fetches return log data needed for the confirmed view
 *
 * @param {string} returnLogId - The UUID of the return log to be fetched
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and licence data
 */
async function go(returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select(
      'licence.id AS licenceId',
      'licence.licenceRef',
      'returnLogs.id',
      'returnLogs.returnReference',
      'returnLogs.status',
      ref('returnLogs.metadata:purposes').as('purposes'),
      ref('returnLogs.metadata:description').as('siteDescription'),
      ReturnLogModel.relatedQuery('returnSubmissions').count().as('submissionCount')
    )
    .innerJoinRelated('licence')
}

export {
  go
}
export default {
  go
}
