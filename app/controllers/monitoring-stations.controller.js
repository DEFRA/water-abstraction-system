/**
 * Controller for /monitoring-stations endpoints
 * @module MonitoringStationsController
 */

import ViewLicenceService from '../services/monitoring-stations/view-licence.service.js'
import ViewService from '../services/monitoring-stations/view.service.js'

async function licence(request, h) {
  const {
    auth,
    params: { licenceId, monitoringStationId }
  } = request

  const pageData = await ViewLicenceService.go(auth, licenceId, monitoringStationId)

  return h.view('monitoring-stations/licence.njk', pageData)
}

async function view(request, h) {
  const {
    auth,
    params: { monitoringStationId }
  } = request

  const pageData = await ViewService.go(auth, monitoringStationId, request.yar)

  return h.view('monitoring-stations/view.njk', pageData)
}

export {
  licence,
  view
}
export default {
  licence,
  view
}
