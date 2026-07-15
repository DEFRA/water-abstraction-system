/**
 * Orchestrates fetching and presenting the data needed for one of the view bill templates
 * @module ViewBillService
 */

import BillingAccountModel from '../../models/billing-account.model.js'
import FetchBillLicence from '../bill-licences/fetch-bill-licence.service.js'
import FetchBillService from './fetch-bill-service.js'
import ViewBillLicencePresenter from '../../presenters/bill-licences/view-bill-licence.presenter.js'
import ViewBillPresenter from '../../presenters/bills/view-bill.presenter.js'
import ViewLicenceSummariesPresenter from '../../presenters/bills/view-licence-summaries.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for one of the view bill templates
 *
 * When viewing a bill we are required to return a different template depending on whether the bill is linked to one or
 * multiple licences.
 *
 * All templates depend on the same bill and billing account data. We show the same thing at the top of the page. But if
 * the bill has multiple licences we show a table that summarises them so depend on `LicenceSummariesPresenter`.
 *
 * Else when there is just 1 licence we show all the transactions details instead (saving the user an extra click!). For
 * this we need to fetch the bill licence and use `ViewBillLicencePresenter` to generate the data.
 *
 * @param {string} id - The UUID for the bill to view
 *
 * @returns {Promise<object>} a formatted representation of the bill, its bill run and billing account plus summaries
 * for all the licences linked to the bill for use in the bill view page
 */
export default async function viewBillService(id) {
  const { bill, licenceSummaries } = await FetchBillService(id)
  const billingAccount = await _fetchBillingAccount(bill.billingAccountId)

  // Irrespective of of how many licences are linked to the bill, the templates always need formatted bill and billing
  // account data
  const billAndBillingAccountData = ViewBillPresenter(bill, billingAccount)

  let additionalData = {}

  // If we have multiple licences we need to provide formatted licence summary data for the multi licence bill template
  if (licenceSummaries.length > 1) {
    additionalData = ViewLicenceSummariesPresenter(licenceSummaries)
  } else {
    // Else we need to provide bill licence data for the single licence bill templates (ViewBillLicencePresenter handles
    // both PRESROC and SROC)
    const billLicence = await FetchBillLicence(licenceSummaries[0].id)

    additionalData = ViewBillLicencePresenter(billLicence)
  }

  return {
    activeNavBar: 'bill-runs',
    ...billAndBillingAccountData,
    ...additionalData
  }
}

async function _fetchBillingAccount(billingAccountId) {
  return BillingAccountModel.query().findById(billingAccountId).modify('contactDetails')
}
