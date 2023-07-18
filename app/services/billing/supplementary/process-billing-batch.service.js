'use strict'

/**
 * Process a given supplementary billing batch for the given billing periods
 * @module ProcessBillingBatchService
 */

const BillingBatchError = require('../../../errors/billing-batch.error.js')
const BillingBatchModel = require('../../../models/water/billing-batch.model.js')
const ChargingModuleGenerateService = require('../../charging-module/generate-bill-run.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const HandleErroredBillingBatchService = require('./handle-errored-billing-batch.service.js')
const LegacyRequestLib = require('../../../lib/legacy-request.lib.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')
const ReissueInvoicesService = require('./reissue-invoices.service.js')
const UnflagUnbilledLicencesService = require('./unflag-unbilled-licences.service.js')

const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

/**
 * Process a given billing batch for the given billing periods. In this case, "process" means that we create the
 * required invoices and transactions for it in both this service and the Charging Module.
 *
 * TODO: flesh out these docs
 *
 * @param {module:BillingBatchModel} billingBatch
 * @param {Object[]} billingPeriods An array of billing periods each containing a `startDate` and `endDate`
 */
async function go (billingBatch, billingPeriods) {
  const { billingBatchId } = billingBatch

  try {
    const startTime = process.hrtime.bigint()

    await _updateStatus(billingBatchId, 'processing')

    const resultOfReissuing = await _reissueInvoices(billingBatch)

    await _processBillingPeriods(billingPeriods, billingBatch, resultOfReissuing)

    _calculateAndLogTime(billingBatchId, startTime)
  } catch (error) {
    await HandleErroredBillingBatchService.go(billingBatchId, error.code)
    _logError(billingBatch, error)
  }
}

async function _processBillingPeriods (billingPeriods, billingBatch, resultOfReissuing) {
  const accumulatedLicenceIds = []

  // We use `results` to check if any db changes have been made (which is indicated by a billing period being processed
  // and returning `true`). We populate it with the result of reissuing as this also indicates whether db changes have
  // been made.
  const results = [resultOfReissuing]

  for (const billingPeriod of billingPeriods) {
    const { chargeVersions, licenceIdsForPeriod } = await _fetchChargeVersions(billingBatch, billingPeriod)
    const isPeriodPopulated = await ProcessBillingPeriodService.go(billingBatch, billingPeriod, chargeVersions)

    accumulatedLicenceIds.push(...licenceIdsForPeriod)
    results.push(isPeriodPopulated)
  }

  await _finaliseBillingBatch(billingBatch, accumulatedLicenceIds, results)
}

/**
 * Call `ReissueInvoicesService` and log the time taken. We return `true` if any invoices have been reissued (which will
 * have resulted in db changes), otherwise we return `false` (to indicate there have been no db changes)
 */
async function _reissueInvoices (billingBatch) {
  // If reissuing isn't enabled then simply return `false` to indicate no db change has been made
  if (!FeatureFlagsConfig.enableReissuingBillingBatches) {
    return false
  }

  const result = await ReissueInvoicesService.go(billingBatch)

  return result
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

  global.GlobalNotifier.omg('Process billing batch complete', { billingBatchId, timeTakenMs })
}

async function _fetchChargeVersions (billingBatch, billingPeriod) {
  try {
    const chargeVersionData = await FetchChargeVersionsService.go(billingBatch.regionId, billingPeriod)

    // We don't just `return FetchChargeVersionsService.go()` as we need to call HandleErroredBillingBatchService if it
    // fails
    return chargeVersionData
  } catch (error) {
    throw new BillingBatchError(error, BillingBatchModel.errorCodes.failedToProcessChargeVersions)
  }
}

/**
 * Finalises the billing batch by unflagging all unbilled licences, requesting the Charging Module run its generate
 * process, and refreshes the billing batch locally. However if there were no resulting invoice licences then we simply
 * unflag the unbilled licences and mark the billing batch with `empty` status
 */
async function _finaliseBillingBatch (billingBatch, accumulatedLicenceIds, resultsOfProcessing) {
  // Creating a new set from accumulatedLicenceIds gives us just the unique ids. Objection does not accept sets in
  // .findByIds() so we spread it into an array
  const allLicenceIds = [...new Set(accumulatedLicenceIds)]

  await UnflagUnbilledLicencesService.go(billingBatch.billingBatchId, allLicenceIds)

  // We set `isPopulated` to `true` if at least one processing result was truthy
  const isPopulated = resultsOfProcessing.some(result => result)

  // If there are no billing invoice licences then the bill run is considered empty. We just need to set the status to
  // indicate this in the UI
  if (!isPopulated) {
    await _updateStatus(billingBatch.billingBatchId, 'empty')
    return
  }

  // We now need to tell the Charging Module to run its generate process. This is where the Charging module finalises
  // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
  await ChargingModuleGenerateService.go(billingBatch.externalId)

  await LegacyRequestLib.post('water', `billing/batches/${billingBatch.billingBatchId}/refresh`)
}

function _logError (billingBatch, error) {
  global.GlobalNotifier.omfg('Billing Batch process errored', { billingBatch }, error)
}

async function _updateStatus (billingBatchId, status) {
  await BillingBatchModel.query()
    .findById(billingBatchId)
    .patch({ status })
}

module.exports = {
  go
}
