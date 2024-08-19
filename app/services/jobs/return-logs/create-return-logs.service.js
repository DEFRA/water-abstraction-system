'use strict'

/**
 * Saves the return logs
 * @module SubmitReturnLogsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Saves the return logs
 *
 * @param {Array} returnLogs - Array of return logs to be created
 */
async function go (returnLogs) {
  await ReturnLogModel.query()
    .insert(returnLogs)
}

module.exports = {
  go
}
