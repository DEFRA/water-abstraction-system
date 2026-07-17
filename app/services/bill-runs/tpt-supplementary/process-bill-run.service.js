/**
 * Process a two-part tariff supplementary bill run for the given billing period
 * @module ProcessBillRunService
 */

import AssignBillRunToLicencesService from '../assign-bill-run-to-licences.service.js'
import BillRunModel from '../../../models/bill-run.model.js'
import GenerateBillRunService from '../tpt-supplementary/generate-bill-run.service.js'
import HandleErroredBillRunService from '../handle-errored-bill-run.service.js'
import MatchAndAllocateService from '../match/match-and-allocate.service.js'
import { calculateAndLogTimeTaken, currentTimeInNanoseconds } from '../../../lib/general.lib.js'

/**
 * Process a two-part tariff supplementary bill run for the given billing period
 *
 * Matches and allocates licences to returns for a two-part tariff bill run
 *
 * The results of the matching process are then persisted to the database ready for the results to be reviewed. The bill
 * run status is also updated to 'review'.
 *
 * In the unlikely event of no licences match to returns it will set the status to 'empty'. It will also handle updating
 * the bill run if an error occurs during the process.
 *
 * @param {module:BillRunModel} billRun - The two-part tariff supplementary bill run being processed
 * @param {object[]} billingPeriods - An array of billing periods each containing a `startDate` and `endDate`. For 2PT
 * this will only ever contain a single period
 */
export default async function processBillRunService(billRun, billingPeriods) {
  const { id: billRunId } = billRun
  // NOTE: billingPeriods come from `DetermineBillingPeriodsService` which always returns an array because it is used by
  // all billing types. For two-part tariff we know it will only contain one because 2PT supplementary bill runs are
  // only for a single financial year
  const billingPeriod = billingPeriods[0]

  try {
    const startTime = currentTimeInNanoseconds()

    await _updateStatus(billRunId, 'processing')

    await AssignBillRunToLicencesService(billRunId)

    const populated = await MatchAndAllocateService(billRun, billingPeriod)

    // NOTE: Unlike two-part tariff annual, we don't automatically set the bill run status to empty if no licences were
    // found to be matched and allocated. This is because for supplementary, we have to handle licences that _were_ 2PT
    // so received a second part charge, but have then had a new charge version added that is either non-chargeable or
    // had the 2PT flag unchecked.
    //
    // These won't be picked up by match and allocate, but we still need to include them when we come to generate the
    // bill run so we can assess if a credit is required.
    if (populated) {
      await _updateStatus(billRunId, 'review')
    } else {
      // When no licences were found to match and allocate, we can immediately proceed to the next step in the bill run
      // process. We don't await it, even though as far as the user is concerned control has already been passed back to
      // them, because the generate engines are intended to be run in the background. Plus, it'd make the log messages
      // confusing ;-)
      GenerateBillRunService(billRun)
    }

    calculateAndLogTimeTaken(startTime, 'Process bill run complete', { billRunId, type: 'two_part_supplementary' })
  } catch (error) {
    await HandleErroredBillRunService(billRunId)
    globalThis.GlobalNotifier.omfg('Process bill run failed', { billRun }, error)
  }
}

async function _updateStatus(billRunId, status) {
  await BillRunModel.query().findById(billRunId).patch({ status })
}
