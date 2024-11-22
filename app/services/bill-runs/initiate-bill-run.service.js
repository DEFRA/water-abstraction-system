'use strict'

/**
 * Handles initiating a new bill run
 * @module InitiateBillRunService
 */

const BillRunModel = require('../../models/bill-run.model.js')
const ChargingModuleCreateBillRunRequest = require('../../requests/charging-module/create-bill-run.request.js')
const CreateBillRunService = require('./create-bill-run.service.js')
const CreateBillRunEventService = require('./create-bill-run-event.service.js')
const DetermineBlockingBillRunService = require('./determine-blocking-bill-run.service.js')
const ExpandedError = require('../../errors/expanded.error.js')

/**
 * Initiate a new bill run
 *
 * Initiating a new bill run means creating both the `billing_batch` and `event` record with the appropriate data,
 * along with a bill run record in the SROC Charging Module API.
 *
 * @param {object} financialYearEndings - Object that contains the from and to financial year endings
 * @param {string} regionId - Id of the region the bill run is for
 * @param {string} batchType - Type of bill run, for example, supplementary
 * @param {string} userEmail - Email address of the user who initiated the bill run
 *
 * @returns {Promise<module:BillRunModel>} The newly created bill run instance
 */
async function go(financialYearEndings, regionId, batchType, userEmail) {
  await _billRunBlocked(regionId, batchType, financialYearEndings.toFinancialYearEnding)

  const chargingModuleResult = await ChargingModuleCreateBillRunRequest.send(regionId, 'sroc')

  const billRunOptions = _billRunOptions(chargingModuleResult, batchType)
  const billRun = await CreateBillRunService.go(regionId, financialYearEndings, billRunOptions)

  await CreateBillRunEventService.go(billRun, userEmail)

  return billRun
}

function _billRunOptions(chargingModuleResult, batchType) {
  const options = {
    batchType,
    scheme: 'sroc'
  }

  if (chargingModuleResult.succeeded) {
    options.externalId = chargingModuleResult.response.body.billRun.id
    options.billRunNumber = chargingModuleResult.response.body.billRun.billRunNumber

    return options
  }

  options.status = 'error'
  options.errorCode = BillRunModel.errorCodes.failedToCreateBillRun

  return options
}

async function _billRunBlocked(regionId, batchType, financialEndYear) {
  const matchResults = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

  // No matches so we can create the bill run
  if (matchResults.length === 0) {
    return
  }

  // You can only have one SROC and PRESROC supplementary being processed at any time. If less than 2 then we can create
  // a bill run
  if (batchType === 'supplementary' && matchResults.length < 2) {
    return
  }

  throw new ExpandedError('Batch already live for region', { billRunId: matchResults[0].id })
}

module.exports = {
  go
}
