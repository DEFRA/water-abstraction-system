'use strict'

/**
 * Updates the under query flag on return logs
 * @module UpdateUnderQueryService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Updates the under query flag on a return log
 *
 * @param {string} returnLogId - The UUID of the return log to update
 * @param {boolean} underQuery - The value to update the under query flag to
 */
async function go(returnLogId, underQuery) {
  await _updateReturnLog(returnLogId, underQuery)
}

async function _updateReturnLog(returnLogId, underQuery) {
  return ReturnLogModel.query().update({ underQuery }).findById(returnLogId)
}

module.exports = {
  go
}
