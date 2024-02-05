'use strict'

/**
 * Processes the two-part tariff match & allocate stage for the given bill run and billing period
 * @module ProcessTwoPartTariffReturnsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const HandleErroredBillRunService = require('../handle-errored-bill-run.service.js')
const MatchAndAllocateService = require('./match-and-allocate.service.js')

/**
 * Matches and allocates licences to returns for a two-part tariff bill run for the given billing periods. The results
 * of this matching process are then persisted to the database ready for the results to be reviewed. The bill run status
 * is then updated based on whether any licences were matched, or if the process has errored.
 *
 * @param {module:BillRunModel} billRun
 * @param {Object[]} billingPeriods An array of billing periods each containing a `startDate` and `endDate`. For 2PT
 * this will only ever contain a single period
 */
async function go (billRun, billingPeriods) {
  const { id: billRunId } = billRun

  try {
    const startTime = currentTimeInNanoseconds()

    await _updateStatus(billRunId, 'processing')

    // `isPopulated` will be set to true if `MatchAndAllocateService` matches at least one licence
    const isPopulated = await MatchAndAllocateService.go(billRun, billingPeriods)

    await _setBillRunStatus(billRunId, isPopulated)

    calculateAndLogTimeTaken(startTime, 'Process bill run complete', { billRunId, type: 'two_part_tariff' })
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId)
    _logError(billRun, error)
  }
}

async function _setBillRunStatus (billRunId, isPopulated) {
  // If there are no bill licences then the bill run is considered empty. We just need to set the status to indicate
  // this in the UI
  if (!isPopulated) {
    await _updateStatus(billRunId, 'empty')
    return
  }

  // If licences are successfully matched to returns then the bill run status is set to 'review'
  await _updateStatus(billRunId, 'review')
}

function _logError (billRun, error) {
  global.GlobalNotifier.omfg('Bill run process errored', { billRun }, error)
}

async function _updateStatus (billRunId, status) {
  await BillRunModel.query()
    .findById(billRunId)
    .patch({ status })
}

module.exports = {
  go
}
