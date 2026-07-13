/**
 * Deletes empty bill runs
 * @module CleanEmptyBillRunsService
 */

import BillRunModel from '../../../models/bill-run.model.js'
import CancelBillBunService from '../../bill-runs/cancel/cancel-bill-run.service.js'
import DeleteBillRunService from '../../bill-runs/cancel/delete-bill-run.service.js'
import UnassignBillRunToLicencesService from '../../bill-runs/unassign-bill-run-to-licences.service.js'

/**
 * Deletes empty bill runs
 *
 * It first identifies which bill runs are empty, then deletes them using the same process as when a user manually
 * cancels a bill run through the UI.
 *
 * This is because there could be numerous child records linked to the bill run that need deleting, plus there is the
 * record in the Charging Module API that also needs dealing with.
 *
 * The services in the cancel bill run feature already handle all this. So, it makes sense to reuse them here.
 *
 * @returns {Promise<number>} The number of rows deleted
 */
export default async function cleanEmptyBillRuns() {
  let billRunId
  let deletedCount = 0

  try {
    const emptyBillRuns = await _fetch()

    for (const emptyBillRun of emptyBillRuns) {
      billRunId = emptyBillRun.id

      const deleted = await _deleteEmptyBillRun(billRunId)

      // Up the count if the bill run was deleted
      deletedCount = deleted ? deletedCount + 1 : deletedCount
    }
  } catch (error) {
    globalThis.GlobalNotifier.omfg('Clean job failed', { billRunId, job: 'clean-empty-bill-runs' }, error)
  }

  return deletedCount
}

async function _deleteEmptyBillRun(billRunId) {
  const billRun = await CancelBillBunService(billRunId)

  if (billRun.status !== 'cancel') {
    return false
  }

  await UnassignBillRunToLicencesService(billRun.id)
  await DeleteBillRunService(billRun)

  return true
}

async function _fetch() {
  return BillRunModel.query().select(['id']).where('status', 'empty')
}
