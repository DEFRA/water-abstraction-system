'use strict'

/**
 * Creates the return logs in the database
 * @module CreateReturnLogsService
 */

const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Given an array of return log objects creates them in the database
 *
 * @param {Array} returnLogs - the array of return logs to create
 */
async function go(returnLogs) {
  await _createReturnLogs(returnLogs)
}

async function _createReturnLogs(returnLogs) {
  for (const returnLog of returnLogs) {
    await ReturnLogModel.query().insert(returnLog)
  }
}

module.exports = {
  go
}
