/**
 * Orchestrates fetching and presenting the data for
 * `/licence-monitoring-station/{licenceMonitoringStationId}/remove` page
 * @module RemoveService
 */

import FetchLicenceMonitoringStationDal from '../../dal/licence-monitoring-station/fetch-licence-monitoring-station.dal.js'
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
export default async function removeService(licenceMonitoringStationId) {
  const licenceMonitoringStation = await FetchLicenceMonitoringStationDal(licenceMonitoringStationId)

  const formattedData = RemovePresenter(licenceMonitoringStation)

  return {
    ...formattedData
  }
}
