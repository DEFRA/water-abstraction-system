/**
 * Orchestrates the removing of a bill from a bill run
 * @module SubmitRemoveBillService
 */

import BillModel from '../../models/bill.model.js'
import DeleteBillRequest from '../../requests/legacy/delete-bill.request.js'
import ProcessBillingFlagService from '../licences/supplementary/process-billing-flag.service.js'
import UnassignLicencesToBillRunService from '../bill-runs/unassign-licences-to-bill-run.service.js'

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
export default async function submitRemoveBillService(billId, user) {
  const bill = await _fetchBill(billId)

  const { billLicences, billRunId } = bill

  await _unassignLicencesToBillRun(billRunId, billLicences)
  await _flagRemovedBill(billLicences)
  await DeleteBillRequest(billRunId, billId, user)

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
    await ProcessBillingFlagService({ billLicenceId: billLicence.id })
  }
}

async function _unassignLicencesToBillRun(billRunId, billLicences) {
  const licenceIds = billLicences.map((billLicence) => {
    return billLicence.licenceId
  })

  await UnassignLicencesToBillRunService(licenceIds, billRunId)
}
