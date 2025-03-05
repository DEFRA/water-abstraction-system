'use strict'

/**
 * Orchestrates the removing of a bill from a bill run
 * @module SubmitRemoveBillService
 */

const BillModel = require('../../models/bill.model.js')

const LegacyDeleteBillRequest = require('../../requests/legacy/delete-bill.request.js')
const ProcessBillingFlagService = require('../licences/supplementary/process-billing-flag.service.js')
const UnassignLicencesToBillRunService = require('../bill-runs/unassign-licences-to-bill-run.service.js')

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
  const bill = await _fetchBill(billId)

  const { billLicences, billRunId } = bill

  await _unassignLicencesToBillRun(billRunId, billLicences)
  await _flagRemovedBill(billLicences)
  await LegacyDeleteBillRequest.send(billRunId, billId, user)

  return `/billing/batch/${billRunId}/processing`
}

async function _fetchBill(billId) {
  return BillModel.query()
    .findById(billId)
    .select(['id', 'billRunId'])
    .withGraphFetched('billLicences')
    .modifyGraph('billLicences', (billLicencesBuilder) => {
      billLicencesBuilder.select(['id', 'licenceId'])
    })
}

async function _flagRemovedBill(billLicences) {
  for (const billLicence of billLicences) {
    await ProcessBillingFlagService.go({ billLicenceId: billLicence.id })
  }
}

async function _unassignLicencesToBillRun(billRunId, billLicences) {
  const licenceIds = billLicences.map((billLicence) => {
    return billLicence.licenceId
  })

  await UnassignLicencesToBillRunService.go(licenceIds, billRunId)
}

module.exports = {
  go
}
