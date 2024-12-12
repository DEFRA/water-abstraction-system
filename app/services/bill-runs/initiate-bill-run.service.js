'use strict'

/**
 * Handles initiating a new bill run
 * @module InitiateBillRunService
 */

const BillRunModel = require('../../models/bill-run.model.js')
const ChargingModuleCreateBillRunRequest = require('../../requests/charging-module/create-bill-run.request.js')
const CreateBillRunService = require('./create-bill-run.service.js')
const CreateBillRunEventService = require('./create-bill-run-event.service.js')

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

module.exports = {
  go
}
