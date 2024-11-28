'use strict'

/**
 * Orchestrates the removing of a bill from a bill run
 * @module SubmitRemoveBillService
 */

const BillModel = require('../../models/bill.model.js')
const BillLicenceModel = require('../../models/bill-licence.model.js')

const LegacyDeleteBillRequest = require('../../requests/legacy/delete-bill.request.js')
const ProcessBillingFlagService = require('../licences/supplementary/process-billing-flag.service.js')

/**
 * Orchestrates the removing of a bill from a bill run
 *
 * This involves calling the `ProcessBillingFlagService` for all the licences associated with the bill for the correct
 * supplementary billing flags to be added to them and then to handle deleting the bill itself calling the legacy
 * service
 *
 * @param {string} billId - UUID of the bill to be removed
 * @param {object} user - Instance of `UserModel` that represents the user making the request
 *
 * @returns {Promise<string>} Returns the redirect path the controller needs
 */
async function go(billId, user) {
  const { billRunId } = await _fetchBill(billId)

  await _flagRemovedBill(billId)
  await LegacyDeleteBillRequest.send(billRunId, billId, user)

  return `/billing/batch/${billRunId}/processing`
}

async function _fetchBill(billId) {
  return BillModel.query().findById(billId).select(['id', 'billRunId'])
}

async function _fetchBillLicences(billId) {
  return BillLicenceModel.query().where('billId', billId).select('id')
}

async function _flagRemovedBill(billId) {
  const billLicences = await _fetchBillLicences(billId)

  for (const billLicence of billLicences) {
    const payload = {
      billLicenceId: billLicence.id
    }

    await ProcessBillingFlagService.go(payload)
  }
}

module.exports = {
  go
}
