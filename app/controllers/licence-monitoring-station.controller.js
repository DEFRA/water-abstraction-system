'use strict'

/**
 * Controller for /licence-monitoring-station endpoints
 * @module LicenceMonitoringStationController
 */

const RemoveService = require('../services/licence-monitoring-station/remove.service.js')

async function remove(request, h) {
  const { licenceMonitoringStationId } = request.params

  const pageData = await RemoveService.go(licenceMonitoringStationId)

  return h.view('licence-monitoring-station/remove.njk', pageData)
}

module.exports = {
  remove
}
