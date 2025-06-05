'use strict'

/**
 * Controller for /licence-monitoring-station endpoints
 * @module LicenceMonitoringStationController
 */

const RemoveService = require('../services/licence-monitoring-station/remove.service.js')
const SubmitRemoveService = require('../services/licence-monitoring-station/submit-remove.service.js')

async function remove(request, h) {
  const { licenceMonitoringStationId } = request.params

  const pageData = await RemoveService.go(licenceMonitoringStationId)

  return h.view('licence-monitoring-station/remove.njk', pageData)
}

async function submitRemove(request, h) {
  const { licenceMonitoringStationId } = request.params
  const { licenceRef, monitoringStationId } = request.payload

  await SubmitRemoveService.go(licenceMonitoringStationId, licenceRef, request.yar)

  return h.redirect(`/system/monitoring-stations/${monitoringStationId}`)
}

module.exports = {
  remove,
  submitRemove
}
