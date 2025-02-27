'use strict'

/**
 * Generates a two-part tariff bill run after the users have completed reviewing its match & allocate results
 * @module GenerateBillRunService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const ChargingModuleGenerateBillRunRequest = require('../../../requests/charging-module/generate-bill-run.request.js')
const ExpandedError = require('../../../errors/expanded.error.js')
const {
  calculateAndLogTimeTaken,
  currentTimeInNanoseconds,
  timestampForPostgres
} = require('../../../lib/general.lib.js')
const FetchBillingAccountsService = require('./fetch-billing-accounts.service.js')
const HandleErroredBillRunService = require('../handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('./process-billing-period.service.js')

/**
 * Generates a two-part tariff bill run after the users have completed reviewing its match & allocate results
 *
 * In this case, "generate" means that we create the required bills and transactions for them in both this service and
 * the Charging Module.
 *
 * > In the other bill run types this would be the `ProcessBillRunService` but that has already been used to handle
 * > the match and allocate process in two-part tariff
 *
 * We first fetch all the billing accounts applicable to this bill run and their charge information. We pass these to
 * `ProcessBillingPeriodService` which will generate the bill for each billing account both in WRLS and the
 * {@link https://github.com/DEFRA/sroc-charging-module-api | Charging Module API (CHA)}.
 *
 * Once `ProcessBillingPeriodService` is complete we tell the CHA to generate the bill run (this calculates final
 * values for each bill and the bill run overall).
 *
 * The final step is to ping the legacy
 * {@link https://github.com/DEFRA/water-abstraction-service | water-abstraction-service} 'refresh' endpoint. That
 * service will extract the final values from the CHA and update the records on our side, finally marking the bill run
 * as **Ready**.
 *
 * @param {module:BillRunModel} billRunId - The UUID of the two-part tariff bill run that has been reviewed and is ready
 * for generating
 */
async function go(billRunId) {
  const billRun = await _fetchBillRun(billRunId)

  if (billRun.status !== 'review') {
    throw new ExpandedError('Cannot process a two-part tariff annual bill run that is not in review', { billRunId })
  }

  if (billRun.batchType !== 'two_part_tariff') {
    throw new ExpandedError('This end point only supports two-part tariff annual', { billRunId })
  }

  await _updateStatus(billRunId, 'processing')

  // NOTE: We do not await this call intentionally. We don't want to block the user while we generate the bill run
  _generateBillRun(billRun)
}

/**
 * Unlike other bill runs where the bill run itself and the bills are generated in one process, two-part tariff is
 * split. The first part which matches and allocates charge information to returns create's the bill run itself. This
 * service handles the second part where we create the bills using the match and allocate data.
 *
 * This means we've already determined the billing period and recorded it against the bill run. So, we retrieve it from
 * the bill run rather than pass it into the service.
 *
 * @private
 */
function _billingPeriod(billRun) {
  const { toFinancialYearEnding } = billRun

  return {
    startDate: new Date(`${toFinancialYearEnding - 1}-04-01`),
    endDate: new Date(`${toFinancialYearEnding}-03-31`)
  }
}

async function _fetchBillingAccounts(billRunId) {
  try {
    return await FetchBillingAccountsService.go(billRunId)
  } catch (error) {
    // We know we're saying we failed to process charge versions. But we're stuck with the legacy error codes and this
    // is the closest one related to what stage we're at in the process
    throw new BillRunError(error, BillRunModel.errorCodes.failedToProcessChargeVersions)
  }
}

async function _fetchBillRun(billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(['id', 'batchType', 'createdAt', 'externalId', 'regionId', 'scheme', 'status', 'toFinancialYearEnding'])
}

async function _finaliseBillRun(billRun, billRunPopulated) {
  // If there are no bill licences then the bill run is considered empty. We just need to set the status to indicate
  // this in the UI
  if (!billRunPopulated) {
    await _updateStatus(billRun.id, 'empty')

    return
  }

  // We now need to tell the Charging Module to run its generate process. This is where the Charging module finalises
  // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
  await ChargingModuleGenerateBillRunRequest.send(billRun.externalId)

  await LegacyRefreshBillRunRequest.send(billRun.id)
}

/**
 * The go() has to deal with updating the status of the bill run and then passing a response back to the request to
 * avoid the user seeing a timeout in their browser. So, this is where we actually generate the bills and record the
 * time taken.
 *
 * @private
 */
async function _generateBillRun(billRun) {
  const { id: billRunId } = billRun

  try {
    const startTime = currentTimeInNanoseconds()

    const billingPeriod = _billingPeriod(billRun)

    await _processBillingPeriod(billingPeriod, billRun)

    calculateAndLogTimeTaken(startTime, 'Process bill run complete', { billRunId })
  } catch (error) {
    await HandleErroredBillRunService.go(billRunId, error.code)
    global.GlobalNotifier.omfg('Bill run process errored', { billRun }, error)
  }
}

async function _processBillingPeriod(billingPeriod, billRun) {
  const { id: billRunId } = billRun

  const billingAccounts = await _fetchBillingAccounts(billRunId)

  const billRunPopulated = await ProcessBillingPeriodService.go(billRun, billingPeriod, billingAccounts)

  await _finaliseBillRun(billRun, billRunPopulated)
}

async function _updateStatus(billRunId, status) {
  return BillRunModel.query().findById(billRunId).patch({ status, updatedAt: timestampForPostgres() })
}

module.exports = {
  go
}
