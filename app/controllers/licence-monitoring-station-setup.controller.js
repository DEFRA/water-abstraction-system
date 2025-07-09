'use strict'

/**
 * Controller for /licence-monitoring-station/setup endpoints
 * @module LicenceMonitoringStationSetupController
 */

const AbstractionPeriodService = require('../services/licence-monitoring-station/setup/abstraction-period.service.js')
const CheckService = require('../services/licence-monitoring-station/setup/check.service.js')
const FullConditionService = require('../services/licence-monitoring-station/setup/full-condition.service.js')
const InitiateSessionService = require('../services/licence-monitoring-station/setup/initiate-session.service.js')
const LicenceNumberService = require('../services/licence-monitoring-station/setup/licence-number.service.js')
const StopOrReduceService = require('../services/licence-monitoring-station/setup/stop-or-reduce.service.js')
const SubmitCheckService = require('../services/licence-monitoring-station/setup/submit-check.service.js')
const SubmitAbstractionPeriodService = require('../services/licence-monitoring-station/setup/submit-abstraction-period.service.js')
const SubmitFullConditionService = require('../services/licence-monitoring-station/setup/submit-full-condition.service.js')
const SubmitLicenceNumberService = require('../services/licence-monitoring-station/setup/submit-licence-number.service.js')
const SubmitStopOrReduceService = require('../services//licence-monitoring-station/setup/submit-stop-or-reduce.service.js')
const SubmitThresholdAndUnitService = require('../services/licence-monitoring-station/setup/submit-threshold-and-unit.service.js')
const ThresholdAndUnitService = require('../services/licence-monitoring-station/setup/threshold-and-unit.service.js')

async function abstractionPeriod(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await AbstractionPeriodService.go(sessionId)

  return h.view('licence-monitoring-station/setup/abstraction-period.njk', pageData)
}

async function check(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await CheckService.go(sessionId)

  return h.view(`licence-monitoring-station/setup/check.njk`, pageData)
}

async function fullCondition(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await FullConditionService.go(sessionId)

  return h.view(`licence-monitoring-station/setup/full-condition.njk`, pageData)
}

async function licenceNumber(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await LicenceNumberService.go(sessionId)

  return h.view(`licence-monitoring-station/setup/licence-number.njk`, pageData)
}

async function submitAbstractionPeriod(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitAbstractionPeriodService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`licence-monitoring-station/setup/abstraction-period.njk`, pageData)
  }

  // This is the last step in the journey so we will always move on to the check page
  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/check`)
}

async function submitCheck(request, h) {
  const {
    params: { sessionId }
  } = request

  const monitoringStationId = await SubmitCheckService.go(sessionId)

  return h.redirect(`/system/monitoring-station/${monitoringStationId}`)
}

async function submitFullCondition(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitFullConditionService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`licence-monitoring-station/setup/full-condition.njk`, pageData)
  }

  // If the user selected a non-condition option then they must enter the abstraction period
  if (pageData.abstractionPeriod) {
    return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/abstraction-period`)
  }

  // Otherwise, they've reached the end of the journey so we send them to the check page
  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/check`)
}

async function submitLicenceNumber(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitLicenceNumberService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`licence-monitoring-station/setup/licence-number.njk`, pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/full-condition`)
}

async function submitSetup(request, h) {
  const { monitoringStationId } = request.payload

  const sessionId = await InitiateSessionService.go(monitoringStationId)

  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/threshold-and-unit`)
}

async function stopOrReduce(request, h) {
  const { sessionId } = request.params

  const pageData = await StopOrReduceService.go(sessionId)

  return h.view(`licence-monitoring-station/setup/stop-or-reduce.njk`, pageData)
}

async function submitStopOrReduce(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitStopOrReduceService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`licence-monitoring-station/setup/stop-or-reduce.njk`, pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/licence-number`)
}

async function submitThresholdAndUnit(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitThresholdAndUnitService.go(sessionId, payload)

  if (pageData.error) {
    return h.view('licence-monitoring-station/setup/threshold-and-unit.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/licence-monitoring-station/setup/${sessionId}/stop-or-reduce`)
}

async function thresholdAndUnit(request, h) {
  const { sessionId } = request.params

  const pageData = await ThresholdAndUnitService.go(sessionId)

  return h.view('licence-monitoring-station/setup/threshold-and-unit.njk', pageData)
}

module.exports = {
  check,
  fullCondition,
  licenceNumber,
  stopOrReduce,
  abstractionPeriod,
  submitAbstractionPeriod,
  submitCheck,
  submitFullCondition,
  submitLicenceNumber,
  submitSetup,
  submitStopOrReduce,
  submitThresholdAndUnit,
  thresholdAndUnit
}
