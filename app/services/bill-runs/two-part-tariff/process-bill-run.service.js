'use strict'

/**
 * Process a given two-part tariff bill run for the given billing periods
 * @module ProcessBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const HandleErroredBillRunService = require('../handle-errored-bill-run.service.js')
const LegacyRequestLib = require('../../../lib/legacy-request.lib.js')
const MatchAndAllocateService = require('./match-and-allocate.service.js')

/**
 * Process a given bill run for the given billing periods. In this case, "process" means that we create the
 * required bills and transactions for it in both this service and the Charging Module.
 *
 * @param {module:BillRunModel} billRun
 * @param {Object[]} billingPeriods An array of billing periods each containing a `startDate` and `endDate`
 */
async function go (billRun, billingPeriods) {
  const { id: billRunId } = billRun

  try {
    const startTime = currentTimeInNanoseconds()

    await _updateStatus(billRunId, 'processing')

    // `isPopulated` will be set to true if `MatchAndAllocateService` matches at least one licence
    const isPopulated = await MatchAndAllocateService.go(billRun, billingPeriods)

    await _finaliseBillRun(billRunId, isPopulated)

    calculateAndLogTimeTaken(startTime, 'Process bill run complete', { billRunId, type: 'two_part_tariff' })
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId, error.code)
    _logError(billRun, error)
  }
}

/**
 * Finalises the bill run by unflagging all unbilled licences, requesting the Charging Module run its generate
 * process, and refreshes the bill run locally. However if there were no resulting bill licences then we simply
 * unflag the unbilled licences and mark the bill run with `empty` status
 */
async function _finaliseBillRun (billRunId, isPopulated) {
  // If there are no bill licences then the bill run is considered empty. We just need to set the status to indicate
  // this in the UI
  if (!isPopulated) {
    await _updateStatus(billRunId, 'empty')
    return
  }

  await _updateStatus(billRunId, 'review')
  await LegacyRequestLib.post('water', `billing/batches/${billRunId}/refresh`)
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
