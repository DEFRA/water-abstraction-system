/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/check` page
 * @module CheckService
 */

import AllowedBillRunPresenter from '../../../presenters/bill-runs/setup/check/allowed-bill-run.presenter.js'
import BlockedBillRunPresenter from '../../../../app/presenters/bill-runs/setup/check/blocked-bill-run.presenter.js'
import DetermineBlockingBillRunService from './determine-blocking-bill-run.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import NoAnnualBillRunPresenter from '../../../presenters/bill-runs/setup/check/no-annual-bill-run.presenter.js'
import { engineTriggers } from '../../../../app/lib/static-lookups.lib.js'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/check` page
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} The view data for the check page
 */
export default async function (sessionId) {
  const session = await FetchSessionDal(sessionId)
  const blockingResults = await DetermineBlockingBillRunService(session)

  const formattedData = _formattedData(session, blockingResults)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}

function _formattedData(session, blockingResults) {
  if (blockingResults.toFinancialYearEnding === 0) {
    return NoAnnualBillRunPresenter(session)
  }

  if (blockingResults.trigger === engineTriggers.neither) {
    return BlockedBillRunPresenter(session, blockingResults)
  }

  return AllowedBillRunPresenter(session, blockingResults)
}
