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
  for (const returnLog of returnLogs) {
    await ReturnLogModel.query()
      .insert(returnLog)
  }
}

module.exports = {
  go
}
