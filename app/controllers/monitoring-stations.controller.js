'use strict'

/**
 * Controller for /monitoring-stations endpoints
 * @module MonitoringStationsController
 */

const LicenceService = require('../services/monitoring-stations/licence.service.js')
const ViewService = require('../services/monitoring-stations/view.service.js')

async function licence(request, h) {
  const {
    auth,
    params: { licenceId, monitoringStationId }
  } = request

  const pageData = await LicenceService.go(auth, licenceId, monitoringStationId)

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

module.exports = {
  licence,
  view
}
