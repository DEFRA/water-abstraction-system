/**
 * Orchestrates fetching and presenting the data needed for the `/monitoring-stations/{id}` page
 * @module ViewService
 */

import FetchMonitoringStationDetailsDal from '../../dal/monitoring-stations/fetch-monitoring-station-details.dal.js'
import ViewPresenter from '../../presenters/monitoring-stations/view.presenter.js'
import { readFlashNotification } from '../../lib/general.lib.js'

/**
 * Orchestrates fetching and presenting the data needed for the `/monitoring-stations/{id}` page
 *
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} monitoringStationId - The UUID for the monitoring station
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} page data needed by the view template
 */
export default async function go(auth, monitoringStationId, yar) {
  const { licenceMonitoringStations, monitoringStation } = await FetchMonitoringStationDetailsDal(monitoringStationId)

  const pageData = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

  const notification = readFlashNotification(yar)

  return {
    notification,
    ...pageData
  }
}
