/**
 * Orchestrates fetching and presenting the data needed for the remove bill page
 * @module RemoveBillService
 */

import FetchBillSummaryService from './fetch-bill-summary.service.js'
import RemoveBillPresenter from '../../presenters/bills/remove-bill.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the remove bill page
 *
 * @param {string} billId - The UUID for the bill to remove
 *
 * @returns {Promise<object>} a formatted representation of the bill, its billing account and the bill run it is linked
 * to for the remove bill page
 */
export default async function removeBill(billId) {
  const bill = await FetchBillSummaryService(billId)

  const formattedData = RemoveBillPresenter(bill)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}
