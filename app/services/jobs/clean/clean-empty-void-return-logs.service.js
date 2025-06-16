'use strict'

/**
 * Deletes voided return logs which have not been received and have no return submissions
 * @module CleanEmptyVoidReturnLogsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnSubmissionModel = require('../../../models/return-submission.model.js')

/**
 * Deletes voided return logs which have not been received and have no return submissions
 *
 * @returns {Promise<number>} The number of rows deleted
 */
async function go() {
  return ReturnLogModel.query()
    .delete()
    .where('status', 'void')
    .whereNull('receivedDate')
    .whereNotExists(
      ReturnSubmissionModel.query().select(1).whereColumn('returnSubmissions.returnLogId', 'returnLogs.id')
    )
}

module.exports = {
  go
}
