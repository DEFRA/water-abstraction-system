'use strict'

/**
 * Cancels the bill run by removing all data relating to it from the database
 * @module CancelBillRunService
 */

const BillRunModel = require('../../models/bill-run.model.js')
const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')
const ReviewChargeElementResultModel = require('../../models/review-charge-element-result.model.js')
const ReviewResultModel = require('../../models/review-result.model.js')
const ReviewReturnResultModel = require('../../models/review-return-result.model.js')

/**
 * Cancels the bill run by deleting the bill run from the Charging Module and then deleting all data relating to it from
 * the database
 *
 * @param {string} id The UUID of the bill run to cancel
 */
async function go (id, billRunBatchType, chargingModuleBillRunId) {
  if (billRunBatchType === 'two_part_tariff') {
    const chargingModuleSucceeded = await _deleteChargingModuleBillRun(chargingModuleBillRunId)

    if (chargingModuleSucceeded) {
      await Promise.all([
        _deletePersistedData(id),
        BillRunModel.query().deleteById(id)
      ])
      global.GlobalNotifier.omg(`Bill run ${id} has been cancelled`)
    }
  } else {
    global.GlobalNotifier.omg(`Invalid batch type of ${billRunBatchType}. Bill run has not been cancelled`)
  }
}

async function _deleteChargingModuleBillRun (chargingModuleBillRunId) {
  const result = await ChargingModuleRequestLib.delete(`v3/wrls/bill-runs/${chargingModuleBillRunId}`)

  if (!result.succeeded) {
    global.GlobalNotifier.omg(`Failed to delete bill run from Charging Module. ${result.response.body.message}`)

    return false
  } else {
    return true
  }
}

async function _deletePersistedData (id) {
  const reviewResults = await ReviewResultModel.query()
    .select('id', 'reviewChargeElementResultId', 'reviewReturnResultId')
    .where('billRunId', id)

  reviewResults.forEach(async (reviewResult) => {
    await ReviewResultModel.query().deleteById(reviewResult.id)
    await ReviewChargeElementResultModel.query().deleteById(reviewResult.reviewChargeElementResultId)
    await ReviewReturnResultModel.query().deleteById(reviewResult.reviewReturnResultId)
  })
}

module.exports = {
  go
}
