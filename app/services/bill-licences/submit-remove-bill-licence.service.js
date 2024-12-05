'use strict'

/**
 * Orchestrates the removing of a bill licence from a bill run
 * @module SubmitRemoveBillLicenceService
 */

const BillLicenceModel = require('../../models/bill-licence.model.js')
const LegacyDeleteBillLicenceRequest = require('../../requests/legacy/delete-bill-licence.request.js')
const ProcessBillingFlagService = require('../licences/supplementary/process-billing-flag.service.js')

/**
 * Orchestrates the removing of a bill licence from a bill run
 *
 * This involves checking if the licence needs to be flagged for supplementary billing by calling the
 * `ProcessBillingFlagService` and then to handle deleting the bill licence itself calling the legacy service
 *
 * @param {string} billLicenceId - UUID of the bill licence to be removed
 * @param {object} user - Instance of `UserModel` that represents the user making the request
 *
 * @returns {Promise<string>} Returns the redirect path the controller needs
 */
async function go(billLicenceId, user) {
  const { bill } = await _fetchBillLicence(billLicenceId)

  const payload = {
    billLicenceId
  }

  await ProcessBillingFlagService.go(payload)
  await LegacyDeleteBillLicenceRequest.send(billLicenceId, user)

  return `/billing/batch/${bill.billRunId}/processing?invoiceId=${bill.id}`
}

async function _fetchBillLicence(billLicenceId) {
  return BillLicenceModel.query()
    .findById(billLicenceId)
    .select(['id'])
    .withGraphFetched('bill')
    .modifyGraph('bill', (builder) => {
      builder.select(['id', 'billRunId'])
    })
}

module.exports = {
  go
}
