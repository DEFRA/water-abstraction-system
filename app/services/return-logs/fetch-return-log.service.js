'use strict'

const ReturnLogModel = require('../../../app/models/return-log.model.js')

/**
 * Fetch the selected return log and all associated data needed for the view
 *
 * @param {string} returnId - The return log ID
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance
 */
async function go(returnId) {
  return _fetch(returnId)
}

async function _fetch(returnId) {
  return ReturnLogModel.query()
    .findById(returnId)
    .withGraphFetched('licence')
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder.orderBy('version', 'desc').limit(1).withGraphFetched('returnSubmissionLines')
    })
}

module.exports = {
  go
}
