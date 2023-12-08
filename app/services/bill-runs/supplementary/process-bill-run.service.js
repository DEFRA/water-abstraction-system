'use strict'

/**
 * Process a given supplementary bill run for the given billing periods
 * @module ProcessBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const BillRunError = require('../../../errors/bill-run.error.js')
const ChargingModuleGenerateService = require('../../charging-module/generate-bill-run.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const HandleErroredBillRunService = require('./handle-errored-bill-run.service.js')
const LegacyRequestLib = require('../../../lib/legacy-request.lib.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')
const ReissueBillsService = require('./reissue-bills.service.js')
const UnflagUnbilledLicencesService = require('./unflag-unbilled-licences.service.js')

const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

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
    const startTime = process.hrtime.bigint()

    await _updateStatus(billRunId, 'processing')

    const resultOfReissuing = await _reissueBills(billRun)

    await _processBillingPeriods(billingPeriods, billRun, resultOfReissuing)

    _calculateAndLogTime(billRunId, startTime)
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId, error.code)
    _logError(billRun, error)
  }
}

async function _processBillingPeriods (billingPeriods, billRun, resultOfReissuing) {
  const accumulatedLicenceIds = []

  // We use `results` to check if any db changes have been made (which is indicated by a billing period being processed
  // and returning `true`). We populate it with the result of reissuing as this also indicates whether db changes have
  // been made.
  const results = [resultOfReissuing]

  for (const billingPeriod of billingPeriods) {
    const { chargeVersions, licenceIdsForPeriod } = await _fetchChargeVersions(billRun, billingPeriod)
    const isPeriodPopulated = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeVersions)

    accumulatedLicenceIds.push(...licenceIdsForPeriod)
    results.push(isPeriodPopulated)
  }

  await _finaliseBillRun(billRun, accumulatedLicenceIds, results)
}

/**
 * Call `ReissueBillsService` and log the time taken. We return `true` if any bills have been reissued (which will
 * have resulted in db changes), otherwise we return `false` (to indicate there have been no db changes)
 */
async function _reissueBills (billRun) {
  // If reissuing isn't enabled then simply return `false` to indicate no db change has been made
  if (!FeatureFlagsConfig.enableReissuingBillingBatches) {
    return false
  }

  const result = await ReissueBillsService.go(billRun)

  return result
}

/**
  * Log the time taken to process the bill run
  *
  * If `notifier` is not set then it will do nothing. If it is set this will get the current time and then calculate the
  * difference from `startTime`. This and the `billRunId` are then used to generate a log message.
  *
  * @param {string} billRunId Id of the bill run currently being 'processed'
  * @param {BigInt} startTime The time the generate process kicked off. It is expected to be the result of a call to
  * `process.hrtime.bigint()`
  */
function _calculateAndLogTime (billRunId, startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Process bill run complete', { billRunId, timeTakenMs })
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

/**
 * Finalises the bill run by unflagging all unbilled licences, requesting the Charging Module run its generate
 * process, and refreshes the bill run locally. However if there were no resulting bill licences then we simply
 * unflag the unbilled licences and mark the bill run with `empty` status
 */
async function _finaliseBillRun (billRun, accumulatedLicenceIds, resultsOfProcessing) {
  // Creating a new set from accumulatedLicenceIds gives us just the unique ids. Objection does not accept sets in
  // .findByIds() so we spread it into an array
  const allLicenceIds = [...new Set(accumulatedLicenceIds)]

  await UnflagUnbilledLicencesService.go(billRun.id, allLicenceIds)

  // We set `isPopulated` to `true` if at least one processing result was truthy
  const isPopulated = resultsOfProcessing.some(result => result)

  // If there are no bill licences then the bill run is considered empty. We just need to set the status to indicate
  // this in the UI
  if (!isPopulated) {
    await _updateStatus(billRun.id, 'empty')
    return
  }

  // We now need to tell the Charging Module to run its generate process. This is where the Charging module finalises
  // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
  await ChargingModuleGenerateService.go(billRun.externalId)

  await LegacyRequestLib.post('water', `billing/batches/${billRun.id}/refresh`)
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
