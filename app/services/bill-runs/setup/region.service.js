/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/region` page
 * @module RegionService
 */

import FetchRegionsService from './fetch-regions.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import RegionPresenter from '../../../presenters/bill-runs/setup/region.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/region` page
 *
 * Supports generating the data needed for the region page in the setup bill run journey. It fetches the current
 * session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} The view data for the region page
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)
  const regions = await FetchRegionsService.go()

  const formattedData = RegionPresenter.go(session, regions)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}

export { go }
export default {
  go
}
