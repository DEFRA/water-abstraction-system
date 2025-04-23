'use strict'

/**
 * Controller for /licence-monitoring-station/setup endpoints
 * @module LicenceMonitoringStationSetupController
 */

const InitiateSessionService = require('../services/licence-monitoring-station/setup/initiate-session.service.js')
const SubmitThresholdAndUnitService = require('../services/licence-monitoring-station/setup/submit-threshold-and-unit.service.js')
const ThresholdAndUnitService = require('../services/licence-monitoring-station/setup/threshold-and-unit.service.js')

async function submitSetup(request, h) {
  const { monitoringStationId } = request.payload

  const sessionId = await InitiateSessionService.go(monitoringStationId)

  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/threshold-and-unit`)
}

async function thresholdAndUnit(request, h) {
  const { sessionId } = request.params

  const pageData = await ThresholdAndUnitService.go(sessionId)

  return h.view('licence-monitoring-station/setup/threshold-and-unit.njk', pageData)
}

async function submitThresholdAndUnit(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitThresholdAndUnitService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('licence-monitoring-station/setup/threshold-and-unit.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/monitoring-station-tags/${sessionId}/check`)
  }

  return h.redirect(`/system/monitoring-station-tags/${sessionId}/stop-or-reduce`)
}

module.exports = {
  submitSetup,
  submitThresholdAndUnit,
  thresholdAndUnit
}
