/**
 * Orchestrates the removing of a bill licence from a bill run
 * @module SubmitRemoveBillLicenceService
 */

import BillLicenceModel from '../../models/bill-licence.model.js'
import { send } from '../../requests/legacy/delete-bill-licence.request.js'
import ProcessBillingFlagService from '../licences/supplementary/process-billing-flag.service.js'
import UnassignLicencesToBillRunService from '../bill-runs/unassign-licences-to-bill-run.service.js'

/**
 * Orchestrates the removing of a bill licence from a bill run
 *
 * After fetching the bill licence and associated bill, it calls `UnassignBillRunToLicencesService` which will unassign
 * this bill run from the licences with matching `licence_supplementary_year` records in the bill licence.
 *
 * But the licence might not have been flagged, for example, this is not a supplementary bill run. SO, next it checks if
 * the licence needs to be flagged for supplementary billing by calling the `ProcessBillingFlagService`.
 *
 * Finally, it calls the legacy service to handle deleting the bill licence itself.
 *
 * @param {string} billLicenceId - UUID of the bill licence to be removed
 * @param {object} user - Instance of `UserModel` that represents the user making the request
 *
 * @returns {Promise<string>} Returns the redirect path the controller needs
 */
export default async function (billLicenceId, user) {
  const billLicence = await _fetchBillLicence(billLicenceId)

  const { bill, licenceId } = billLicence

  await UnassignLicencesToBillRunService([licenceId], bill.billRunId)
  await ProcessBillingFlagService({ billLicenceId })
  await send(billLicenceId, user)

  return `/billing/batch/${bill.billRunId}/processing?invoiceId=${bill.id}`
}

async function _fetchBillLicence(billLicenceId) {
  return BillLicenceModel.query()
    .findById(billLicenceId)
    .select(['id', 'licenceId'])
    .withGraphFetched('bill')
    .modifyGraph('bill', (builder) => {
      builder.select(['id', 'billRunId'])
    })
}
