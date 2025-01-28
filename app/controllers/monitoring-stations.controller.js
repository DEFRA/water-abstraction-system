'use strict'

/**
 * Controller for /monitoring-stations endpoints
 * @module MonitoringStationsController
 */

const ViewService = require('../services/monitoring-stations/view.service.js')

async function view(request, h) {
  const {
    auth,
    params: { monitoringStationId }
  } = request

  const pageData = await ViewService.go(monitoringStationId, auth)

  return h.view('monitoring-stations/view.njk', pageData)
}

module.exports = {
  view
}
