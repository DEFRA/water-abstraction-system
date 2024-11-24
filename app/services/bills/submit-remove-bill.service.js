'use strict'

/**
 * Orchestrates the removing of a bill from a bill run
 * @module SubmitRemoveBillService
 */

const BillModel = require('../../models/bill.model.js')
const LegacyDeleteBillRequest = require('../../requests/legacy/delete-bill.request.js')

/**
 * Orchestrates the removing of a bill from a bill run
 *
 * @param {string} billId - UUID of the bill to be removed
 * @param {object} user - Instance of `UserModel` that represents the user making the request
 *
 * @returns {Promise<string>} Returns the redirect path the controller needs
 */
async function go(billId, user) {
  const { billRunId } = await _fetchBill(billId)

  await LegacyDeleteBillRequest.send(billRunId, billId, user)

  return `/billing/batch/${billRunId}/processing`
}

async function _fetchBill(billId) {
  return BillModel.query().findById(billId).select(['id', 'billRunId'])
}

module.exports = {
  go
}
