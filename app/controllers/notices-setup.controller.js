'use strict'

/**
 * Controller for /notices/setup endpoints
 * @module NoticesSetupController
 */

const AlertEmailAddressService = require('../services/notices/setup/abstraction-alerts/alert-email-address.service.js')
const AlertThresholdsService = require('../services/notices/setup/abstraction-alerts/alert-thresholds.service.js')
const AlertTypeService = require('../services/notices/setup/abstraction-alerts/alert-type.service.js')
const CancelAlertsService = require('../services/notices/setup/abstraction-alerts/cancel-alerts.service.js')
const CancelService = require('../services/notices/setup/cancel.service.js')
const CheckLicenceMatchesService = require('../services/notices/setup/abstraction-alerts/check-licence-matches.service.js')
const CheckService = require('../services/notices/setup/check.service.js')
const ConfirmationService = require('../services/notices/setup/confirmation.service.js')
const DownloadRecipientsService = require('../services/notices/setup/download-recipients.service.js')
const InitiateSessionService = require('../services/notices/setup/initiate-session.service.js')
const LicenceService = require('../services/notices/setup/licence.service.js')
const RemoveLicencesService = require('../services/notices/setup/remove-licences.service.js')
const RemoveThresholdService = require('../services/notices/setup/abstraction-alerts/remove-threshold.service.js')
const ReturnsPeriodService = require('../services/notices/setup/returns-period/returns-period.service.js')
const SubmitAlertEmailAddressService = require('../services/notices/setup/abstraction-alerts/submit-alert-email-address.service.js')
const SubmitAlertThresholdsService = require('../services/notices/setup/abstraction-alerts/submit-alert-thresholds.service.js')
const SubmitAlertTypeService = require('../services/notices/setup/abstraction-alerts/submit-alert-type.service.js')
const SubmitCancelAlertsService = require('../services/notices/setup/abstraction-alerts/submit-cancel-alerts.service.js')
const SubmitCancelService = require('../services/notices/setup/submit-cancel.service.js')
const SubmitCheckLicenceMatchesService = require('../services/notices/setup/abstraction-alerts/submit-check-licence-matches.service.js')
const SubmitCheckService = require('../services/notices/setup/submit-check.service.js')
const SubmitLicenceService = require('../services/notices/setup/submit-licence.service.js')
const SubmitRemoveLicencesService = require('../services/notices/setup/submit-remove-licences.service.js')
const SubmitReturnsPeriodService = require('../services/notices/setup/returns-period/submit-returns-period.service.js')

const basePath = 'notices/setup'

async function downloadRecipients(request, h) {
  const {
    params: { sessionId }
  } = request

  const { data, type, filename } = await DownloadRecipientsService.go(sessionId)

  return h
    .response(data)
    .type(type)
    .encoding('binary')
    .header('Content-Type', type)
    .header('Content-Disposition', `attachment; filename="${filename}"`)
}

async function viewAlertEmailAddress(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const pageData = await AlertEmailAddressService.go(sessionId, auth)

  return h.view(`notices/setup/abstraction-alerts/alert-email-address.njk`, pageData)
}

async function viewAlertThresholds(request, h) {
  const { sessionId } = request.params

  const pageData = await AlertThresholdsService.go(sessionId)

  return h.view(`notices/setup/abstraction-alerts/alert-thresholds.view.njk`, pageData)
}

async function viewAlertType(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await AlertTypeService.go(sessionId)

  return h.view(`${basePath}/abstraction-alerts/alert-type.njk`, pageData)
}

async function viewCancel(request, h) {
  const { sessionId } = request.params

  const pageData = await CancelService.go(sessionId)

  return h.view(`${basePath}/cancel.njk`, pageData)
}

async function viewCancelAlerts(request, h) {
  const { sessionId } = request.params

  const pageData = await CancelAlertsService.go(sessionId)

  return h.view(`notices/setup/abstraction-alerts/cancel-alerts.njk`, pageData)
}

async function viewCheckLicenceMatches(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await CheckLicenceMatchesService.go(sessionId, yar)

  return h.view(`notices/setup/abstraction-alerts/check-licence-matches.njk`, pageData)
}

async function viewConfirmation(request, h) {
  const { eventId } = request.params

  const pageData = await ConfirmationService.go(eventId)

  return h.view(`${basePath}/confirmation.njk`, pageData)
}

async function viewLicence(request, h) {
  const { sessionId } = request.params

  const pageData = await LicenceService.go(sessionId)

  return h.view(`${basePath}/licence.njk`, pageData)
}

async function viewRemoveLicences(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await RemoveLicencesService.go(sessionId)

  return h.view(`${basePath}/remove-licences.njk`, pageData)
}

async function viewReturnsPeriod(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ReturnsPeriodService.go(sessionId)

  return h.view(`${basePath}/view-returns-period.njk`, pageData)
}

async function viewCheck(request, h) {
  const {
    params: { sessionId },
    query: { page }
  } = request

  const pageData = await CheckService.go(sessionId, page)

  return h.view(`${basePath}/check.njk`, pageData)
}

async function viewRemoveThreshold(request, h) {
  const {
    params: { sessionId, licenceMonitoringStationId },
    yar
  } = request

  await RemoveThresholdService.go(sessionId, licenceMonitoringStationId, yar)

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches`)
}

async function setup(request, h) {
  const { journey, monitoringStationId } = request.query

  const { sessionId, path } = await InitiateSessionService.go(journey, monitoringStationId)

  return h.redirect(`/system/${basePath}/${sessionId}/${path}`)
}

async function submitAlertEmailAddress(request, h) {
  const {
    auth,
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAlertEmailAddressService.go(sessionId, payload, auth)

  if (pageData.error) {
    return h.view(`notices/setup/abstraction-alerts/alert-email-address.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/check`)
}

async function submitAlertThresholds(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAlertThresholdsService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`notices/setup/abstraction-alerts/alert-thresholds.view.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches`)
}

async function submitAlertType(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAlertTypeService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`${basePath}/abstraction-alerts/alert-type.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/alert-thresholds`)
}

async function submitCancel(request, h) {
  const { sessionId } = request.params

  await SubmitCancelService.go(sessionId)

  return h.redirect(`/manage`)
}

async function submitCancelAlerts(request, h) {
  const {
    params: { sessionId }
  } = request

  const { monitoringStationId } = await SubmitCancelAlertsService.go(sessionId)

  return h.redirect(`/system/monitoring-stations/${monitoringStationId}`)
}

async function submitCheck(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const eventId = await SubmitCheckService.go(sessionId, auth)

  return h.redirect(`/system/${basePath}/${eventId}/confirmation`)
}

async function submitCheckLicenceMatches(request, h) {
  const {
    params: { sessionId }
  } = request

  await SubmitCheckLicenceMatchesService.go(sessionId)

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/alert-email-address`)
}

async function submitLicence(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitLicenceService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view(`${basePath}/licence.njk`, pageData)
  }

  return h.redirect(`/system/${basePath}/${sessionId}/check`)
}

async function submitRemoveLicences(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitRemoveLicencesService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`${basePath}/remove-licences.njk`, pageData)
  }

  return h.redirect(`/system/${basePath}/${pageData.redirect}`)
}

async function submitReturnsPeriod(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitReturnsPeriodService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`${basePath}/view-returns-period.njk`, pageData)
  }

  return h.redirect(`/system/${basePath}/${pageData.redirect}`)
}

module.exports = {
  downloadRecipients,
  viewAlertEmailAddress,
  viewAlertThresholds,
  viewAlertType,
  viewCancel,
  viewCancelAlerts,
  viewCheck,
  viewCheckLicenceMatches,
  viewConfirmation,
  viewLicence,
  viewRemoveLicences,
  viewRemoveThreshold,
  viewReturnsPeriod,
  setup,
  submitAlertEmailAddress,
  submitAlertThresholds,
  submitAlertType,
  submitCancel,
  submitCancelAlerts,
  submitCheck,
  submitCheckLicenceMatches,
  submitLicence,
  submitRemoveLicences,
  submitReturnsPeriod
}
