/**
 * Controller for /licence-monitoring-station endpoints
 * @module LicenceMonitoringStationController
 */

import RemoveService from '../services/licence-monitoring-station/remove.service.js'
import SubmitRemoveService from '../services/licence-monitoring-station/submit-remove.service.js'

export async function remove(request, h) {
  const { licenceMonitoringStationId } = request.params

  const pageData = await RemoveService(licenceMonitoringStationId)

  return h.view('licence-monitoring-station/remove.njk', pageData)
}

export async function submitRemove(request, h) {
  const { licenceMonitoringStationId } = request.params
  const { licenceRef, monitoringStationId } = request.payload

  await SubmitRemoveService(licenceMonitoringStationId, licenceRef, request.yar)

  return h.redirect(`/system/monitoring-stations/${monitoringStationId}`)
}
