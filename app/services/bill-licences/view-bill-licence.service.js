/**
 * Orchestrates fetching and presenting the data needed for the view bill licence page
 * @module ViewBillLicenceService
 */

import FetchBillLicenceService from './fetch-bill-licence.service.js'
import ViewBillLicencePresenter from '../../presenters/bill-licences/view-bill-licence.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the view bill licence page
 *
 * @param {string} id - The UUID for the bill licence to view
 *
 * @returns {Promise<object>} a formatted representation of the bill licence and its transactions for use in the bill
 * licence view page
 */
async function go(id) {
  const billLicence = await FetchBillLicenceService.go(id)

  const formattedData = ViewBillLicencePresenter.go(billLicence)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}

export default {
  go
}
