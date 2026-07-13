/**
 * Deletes voided return logs which have not been received and have no return submissions
 * @module CleanEmptyVoidReturnLogsService
 */

import ReturnLogModel from '../../../models/return-log.model.js'
import ReturnSubmissionModel from '../../../models/return-submission.model.js'

/**
 * Deletes voided return logs which have not been received and have no return submissions
 *
 * @returns {Promise<number>} The number of rows deleted
 */
export default async function () {
  let deletedCount = 0

  try {
    deletedCount = await ReturnLogModel.query()
      .delete()
      .where('status', 'void')
      .whereNull('receivedDate')
      .whereNotExists(
        ReturnSubmissionModel.query().select(1).whereColumn('returnSubmissions.returnLogId', 'returnLogs.id')
      )
  } catch (error) {
    globalThis.GlobalNotifier.omfg('Clean job failed', { job: 'clean-empty-void-return-logs' }, error)
  }

  return deletedCount
}
