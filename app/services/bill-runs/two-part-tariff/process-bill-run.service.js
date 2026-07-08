/**
 * Process a given two-part tariff bill run for the given billing periods
 * @module ProcessBillRunService
 */

import BillRunModel from '../../../models/bill-run.model.js'
import { calculateAndLogTimeTaken, currentTimeInNanoseconds } from '../../../lib/general.lib.js'
import HandleErroredBillRunService from '../handle-errored-bill-run.service.js'
import MatchAndAllocateService from '../match/match-and-allocate.service.js'

/**
 * Matches and allocates licences to returns for a two-part tariff bill run
 *
 * The results of the matching process are then persisted to the database ready for the results to be reviewed. The bill
 * run status is also updated to 'review'.
 *
 * In the unlikely event of no licences match to returns it will set the status to 'empty'. It will also handle updating
 * the bill run if an error occurs during the process.
 *
 * @param {module:BillRunModel} billRun - The two-part tariff bill run being processed
 * @param {object[]} billingPeriods - An array of billing periods each containing a `startDate` and `endDate`. For 2PT
 * this will only ever contain a single period
 */
export default async function go(billRun, billingPeriods) {
  const { id: billRunId } = billRun
  // NOTE: billingPeriods come from `DetermineBillingPeriodsService` which always returns an array because it is used by
  // all billing types. For two-part tariff we know it will only contain one because 2PT bill runs are only for a single
  // financial year
  const billingPeriod = billingPeriods[0]

  try {
    const startTime = currentTimeInNanoseconds()

    await _updateStatus(billRunId, 'processing')

    const populated = await MatchAndAllocateService(billRun, billingPeriod)

    await _setBillRunStatus(billRunId, populated)

    calculateAndLogTimeTaken(startTime, 'Process bill run complete', { billRunId, type: 'two_part_tariff' })
  } catch (error) {
    await HandleErroredBillRunService(billRunId)
    globalThis.GlobalNotifier.omfg('Process bill run failed', { billRun }, error)
  }
}

async function _setBillRunStatus(billRunId, populated) {
  // It is highly unlikely no licences were matched to returns. So we default status to 'review'
  let status = 'review'

  // Just in case no licences were found to be matched to returns we set the status to 'empty'
  if (!populated) {
    status = 'empty'
  }

  // Update the bill run's status
  return _updateStatus(billRunId, status)
}

async function _updateStatus(billRunId, status) {
  return BillRunModel.query().findById(billRunId).patch({ status })
}
