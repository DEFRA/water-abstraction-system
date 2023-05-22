'use strict'

const BillingBatchError = require('../../errors/billing-batch.error.js')
const BillingBatchModel = require('../../models/water/billing-batch.model.js')
const ChargingModuleGenerateService = require('../charging-module/generate-bill-run.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const HandleErroredBillingBatchService = require('./handle-errored-billing-batch.service.js')
const LegacyRequestLib = require('../../lib/legacy-request.lib.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')
const UnflagUnbilledLicencesService = require('./unflag-unbilled-licences.service.js')

async function go (billingBatch, billingPeriods) {
  const currentBillingPeriod = billingPeriods.at(-1)
  const { billingBatchId } = billingBatch

  try {
    // Mark the start time for later logging
    const startTime = process.hrtime.bigint()

    await _updateStatus(billingBatchId, 'processing')

    const chargeVersions = await _fetchChargeVersions(billingBatch, currentBillingPeriod)
    const isEmpty = await ProcessBillingPeriodService.go(billingBatch, currentBillingPeriod, chargeVersions)

    await _finaliseBillingBatch(billingBatch, chargeVersions, isEmpty)

    // Log how long the process took
    _calculateAndLogTime(billingBatchId, startTime)
  } catch (error) {
    await HandleErroredBillingBatchService.go(billingBatchId, error.code)
    _logError(billingBatch, error)
  }
}

/**
  * Log the time taken to process the billing batch
  *
  * If `notifier` is not set then it will do nothing. If it is set this will get the current time and then calculate the
  * difference from `startTime`. This and the `billRunId` are then used to generate a log message.
  *
  * @param {string} billingBatchId Id of the billing batch currently being 'processed'
  * @param {BigInt} startTime The time the generate process kicked off. It is expected to be the result of a call to
  * `process.hrtime.bigint()`
  */
function _calculateAndLogTime (billingBatchId, startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg(`Time taken to process billing batch ${billingBatchId}: ${timeTakenMs}ms`)
}

async function _fetchChargeVersions (billingBatch, billingPeriod) {
  try {
    const chargeVersions = await FetchChargeVersionsService.go(billingBatch.regionId, billingPeriod)

    // We don't just `return FetchChargeVersionsService.go()` as we need to call HandleErroredBillingBatchService if it
    // fails
    return chargeVersions
  } catch (error) {
    throw new BillingBatchError(error, BillingBatchModel.errorCodes.failedToProcessChargeVersions)
  }
}

/**
 * Finalises the billing batch by unflagging all unbilled licences, requesting the Charging Module run its generate
 * process, and refreshes the billing batch locally. However if there were no resulting invoice licences then we simply
 * unflag the unbilled licences and mark the billing batch with `empty` status
 */
async function _finaliseBillingBatch (billingBatch, chargeVersions, isEmpty) {
  await UnflagUnbilledLicencesService.go(billingBatch.billingBatchId, chargeVersions)

  // If there are no billing invoice licences then the bill run is considered empty. We just need to set the status to
  // indicate this in the UI
  if (isEmpty) {
    return _updateStatus(billingBatch.billingBatchId, 'empty')
  }

  // We then need to tell the Charging Module to run its generate process. This is where the Charging module finalises
  // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
  await ChargingModuleGenerateService.go(billingBatch.externalId)

  await LegacyRequestLib.post('water', `billing/batches/${billingBatch.billingBatchId}/refresh`)
}

function _logError (billingBatch, error) {
  global.GlobalNotifier.omfg(
    'Billing Batch process errored',
    {
      billingBatch,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    })
}

async function _updateStatus (billingBatchId, status) {
  await BillingBatchModel.query()
    .findById(billingBatchId)
    .patch({ status })
}

module.exports = {
  go
}
