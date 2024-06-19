'use strict'

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

async function go (billRunId) {
  const billRun = await _fetchBillRun(billRunId)

  if (billRun.status !== 'review') {
    throw new ExpandedError('Cannot process a two-part tariff bill run that is not in review', { billRunId })
  }

  await _updateStatus(billRunId, 'processing')

  _generateBillRun(billRun)
}

async function _fetchBillingAccounts (billRunId) {
  try {
    // We don't just `return FetchBillingDataService.go()` as we need to call HandleErroredBillRunService if it
    // fails
    const billingAccounts = await FetchBillingAccountsService.go(billRunId)

    return billingAccounts
  } catch (error) {
    // We know we're saying we failed to process charge versions. But we're stuck with the legacy error codes and this
    // is the closest one related to what stage we're at in the process
    throw new BillRunError(error, BillRunModel.errorCodes.failedToProcessChargeVersions)
  }
}

async function _fetchBillRun (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select([
      'id',
      'batchType',
      'createdAt',
      'externalId',
      'regionId',
      'scheme',
      'status',
      'toFinancialYearEnding'
    ])
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
  await ChargingModuleGenerateBillRunRequest.send(billRun.externalId)

  await LegacyRefreshBillRunRequest.send(billRun.id)
}

async function _generateBillRun (billRun) {
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

async function _processBillingPeriod (billingPeriod, billRun) {
  const { id: billRunId } = billRun

  const billingAccounts = await _fetchBillingAccounts(billRunId)

  const billRunPopulated = await ProcessBillingPeriodService.go(billRun, billingPeriod, billingAccounts)

  await _finaliseBillRun(billRun, billRunPopulated)
}

async function _updateStatus (billRunId, status) {
  return BillRunModel.query()
    .findById(billRunId)
    .patch({ status, updatedAt: timestampForPostgres() })
}

function _billingPeriod (billRun) {
  const { toFinancialYearEnding } = billRun

  return {
    startDate: new Date(`${toFinancialYearEnding - 1}-04-01`),
    endDate: new Date(`${toFinancialYearEnding}-03-31`)
  }
}

module.exports = {
  go
}
