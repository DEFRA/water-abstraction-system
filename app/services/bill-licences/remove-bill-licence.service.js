/**
 * Orchestrates fetching and presenting the data needed for the remove bill licence page
 * @module RemoveBillLicenceService
 */

import FetchBillLicenceSummaryService from './fetch-bill-licence-summary.service.js'
import RemoveBillLicencePresenter from '../../presenters/bill-licences/remove-bill-licence.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the remove bill licence page
 *
 * @param {string} billLicenceId - The UUID for the bill licence to remove
 *
 * @returns {Promise<object>} a formatted representation of the bill licence, its bill, billing account and the bill run
 * it is linked to for the remove bill licence page
 */
export default async function removeBillLicenceService(billLicenceId) {
  const billLicence = await FetchBillLicenceSummaryService(billLicenceId)

  const formattedData = RemoveBillLicencePresenter(billLicence)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}
