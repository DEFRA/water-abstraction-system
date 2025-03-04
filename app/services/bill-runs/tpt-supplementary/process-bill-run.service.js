'use strict'

/**
 * Process a two-part tariff supplementary bill run for the given billing period
 * @module ProcessBillRunService
 */

const AssignBillRunToLicencesService = require('../assign-bill-run-to-licences.service.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const HandleErroredBillRunService = require('../handle-errored-bill-run.service.js')
const MatchAndAllocateService = require('../match/match-and-allocate.service.js')

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
async function go(billRun, billingPeriods) {
  const { id: billRunId } = billRun
  // NOTE: billingPeriods come from `DetermineBillingPeriodsService` which always returns an array because it is used by
  // all billing types. For two-part tariff we know it will only contain one because 2PT supplementary bill runs are
  // only for a single financial year
  const billingPeriod = billingPeriods[0]

  try {
    const startTime = currentTimeInNanoseconds()

    await _updateStatus(billRunId, 'processing')

    // `populated` will be set to true if `MatchAndAllocateService` processes at least one licence
    const licences = await MatchAndAllocateService.go(billRun, billingPeriod)

    await AssignBillRunToLicencesService.go(billRunId, licences, billingPeriod, true)

    const populated = licences.length > 0

    await _setBillRunStatus(billRunId, populated)

    calculateAndLogTimeTaken(startTime, 'Process bill run complete', { billRunId, type: 'two_part_supplementary' })
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId)
    global.GlobalNotifier.omfg('Process bill run failed', { billRun }, error)
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
  await _updateStatus(billRunId, status)
}

async function _updateStatus(billRunId, status) {
  await BillRunModel.query().findById(billRunId).patch({ status })
}

module.exports = {
  go
}
