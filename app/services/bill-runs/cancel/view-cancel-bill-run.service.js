/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 * @module ViewCancelBillRunService
 */

import BillRunModel from '../../../models/bill-run.model.js'
import ViewCancelBillRunPresenter from '../../../presenters/bill-runs/view-cancel-bill-run.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 *
 * @param {string} id - The UUID of the bill run to cancel
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the cancel bill run template. It contains
 * details of the bill run.
 */
async function go(id) {
  const billRun = await _fetchBillRun(id)

  const formattedData = ViewCancelBillRunPresenter.go(billRun)

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

export {
  go
}
export default {
  go
}
