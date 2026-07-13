/**
 * Orchestrates fetching and presenting the data needed for the send bill run confirmation page
 * @module ViewSendBillRunService
 */

import BillRunModel from '../../../models/bill-run.model.js'
import ViewSendBillRunPresenter from '../../../presenters/bill-runs/view-send-bill-run.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the send bill run confirmation page
 *
 * @param {string} id - The UUID of the bill run to send
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the send bill run template. It contains
 * details of the bill run.
 */
export default async function (id) {
  const billRun = await _fetchBillRun(id)

  const formattedData = ViewSendBillRunPresenter(billRun)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}

async function _fetchBillRun(id) {
  return BillRunModel.query()
    .findById(id)
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
}
