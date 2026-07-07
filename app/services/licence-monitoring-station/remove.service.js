/**
 * Orchestrates fetching and presenting the data for
 * `/licence-monitoring-station/{licenceMonitoringStationId}/remove` page
 * @module RemoveService
 */

import FetchLicenceMonitoringStationService from './fetch-licence-monitoring-station.service.js'
import RemovePresenter from '../../presenters/licence-monitoring-station/remove.presenter.js'

/**
 * Orchestrates fetching and presenting the data for
 * `/licence-monitoring-station/{licenceMonitoringStationId}/remove` page
 *
 * It fetches details of the licence monitoring station tag to be removed.
 *
 * @param {string} licenceMonitoringStationId - The UUID of the licence monitoring station record
 *
 * @returns {Promise<object>} The view data for the remove licence tag page
 */
async function go(licenceMonitoringStationId) {
  const licenceMonitoringStation = await FetchLicenceMonitoringStationService.go(licenceMonitoringStationId)

  const formattedData = RemovePresenter.go(licenceMonitoringStation)

  return {
    ...formattedData
  }
}

export {
  go
}
export default {
  go
}
