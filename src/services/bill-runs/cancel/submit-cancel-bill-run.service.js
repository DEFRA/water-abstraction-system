/**
 * Orchestrates the cancelling of a bill run
 * @module SubmitCancelBillRunService
 */

import CancelBillRunService from './cancel-bill-run.service.js'
import DeleteBillRunDal from '../../../dal/bill-runs/cancel/delete-bill-run.dal.js'
import UnassignBillRunToLicencesDal from '../../../dal/bill-runs/unassign-bill-run-to-licences.dal.js'

/**
 * Orchestrates the cancelling of a bill run
 *
 * It first calls `CancelBillRunService` which will determine if the bill run _can_ be cancelled. If it can, it will
 * update the status of the bill run to 'cancel'.
 *
 * It returns the fetched instance of the bill run, with the status set to 'cancel' if the bill run was cancelled.
 *
 * It then calls `UnassignBillRunToLicencesDal` which will unassign the bill run from any licences with matching
 * `licence_supplementary_year` records.
 *
 * Finally, it calls `DeleteBillRunDal` which will delete the bill run and all its associated records. It will also
 * send a delete request to the Charging Module API.
 *
 * We specifically do not await the `DeleteBillRunDal` call here as we do not want to block the request. This
 * is because it can take up to 30 mins to delete everything associated with a bill run!
 *
 * @param {string} billRunId  - UUID of the bill run to be cancelled
 */
export default async function submitCancelBillRunService(billRunId) {
  const billRun = await CancelBillRunService(billRunId)

  if (billRun.status === 'cancel') {
    await UnassignBillRunToLicencesDal(billRun.id)
    DeleteBillRunDal(billRun)
  }
}
