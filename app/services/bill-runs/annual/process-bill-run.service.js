'use strict'

/**
 * Process a given annual bill run for the given billing periods
 * @module ProcessBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const BillRunError = require('../../../errors/bill-run.error.js')
const ChargingModuleGenerateService = require('../../charging-module/generate-bill-run.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const LegacyRequestLib = require('../../../lib/legacy-request.lib.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')

// TODO: needs to be move to root of bill-runs
const HandleErroredBillRunService = require('../supplementary/handle-errored-bill-run.service.js')

async function go (billRun, billingPeriod) {
  const { id: billRunId, batchType } = billRun

  try {
    const startTime = process.hrtime.bigint()

    await _updateStatus(billRunId, 'processing')

    await _processBillingPeriod(billingPeriod, billRun)

    _calculateAndLogTime(startTime, 'Process bill run complete', { billRunId, batchType })
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId, error.code)
    global.GlobalNotifier.omfg('Bill run process errored', { billRun }, error)
  }
}

function _calculateAndLogTime (startTime, message, data) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n
  const timeTakenSs = timeTakenMs / 1000n

  const logData = {
    timeTakenMs,
    timeTakenSs,
    ...data
  }

  global.GlobalNotifier.omg(message, logData)
}

async function _fetchChargeVersions (billRun, billingPeriod) {
  try {
    const chargeVersionData = await FetchChargeVersionsService.go(billRun.regionId, billingPeriod)

    // We don't just `return FetchChargeVersionsService.go()` as we need to call HandleErroredBillRunService if it
    // fails
    return chargeVersionData
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToProcessChargeVersions)
  }
}

async function _finaliseBillRun (billRun, billRunPopulated) {
  // If there are no bill licences then the bill run is considered empty. We just need to set the status to indicate
  // this in the UI
  if (!billRunPopulated) {
    await _updateStatus(billRun.id, 'empty')
    return
  }

  // We now need to tell the Charging Module to run its generate process. This is where the Charging module finalises
  // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
  await ChargingModuleGenerateService.go(billRun.externalId)

  // await LegacyRequestLib.post('water', `billing/batches/${billRun.id}/refresh`)
}

async function _processBillingPeriod (billingPeriod, billRun) {
  const chargeVersions = await _fetchChargeVersions(billRun, billingPeriod)

  const billRunPopulated = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeVersions)

  await _finaliseBillRun(billRun, billRunPopulated)
}

// TODO: Move to shared service
async function _updateStatus (billRunId, status) {
  await BillRunModel.query()
    .findById(billRunId)
    .patch({ status })
}

module.exports = {
  go
}
