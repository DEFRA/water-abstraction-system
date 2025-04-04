'use strict'

/**
 * Controller for /notifications/setup endpoints
 * @module NotificationsSetupController
 */

const AdHocLicenceService = require('../services/notifications/setup/ad-hoc-licence.service.js')
const CancelService = require('../services/notifications/setup/cancel.service.js')
const ConfirmationService = require('../services/notifications/setup/confirmation.service.js')
const CheckService = require('../services/notifications/setup/check.service.js')
const DownloadRecipientsService = require('../services/notifications/setup/download-recipients.service.js')
const InitiateSessionService = require('../services/notifications/setup/initiate-session.service.js')
const RemoveLicencesService = require('../services/notifications/setup/remove-licences.service.js')
const ReturnsPeriodService = require('../services/notifications/setup/returns-period.service.js')
const SubmitAdHocLicenceService = require('../services/notifications/setup/submit-ad-hoc-licence.service.js')
const SubmitCancelService = require('../services/notifications/setup/submit-cancel.service.js')
const SubmitCheckService = require('../services/notifications/setup/submit-check.service.js')
const SubmitRemoveLicencesService = require('../services/notifications/setup/submit-remove-licences.service.js')
const SubmitReturnsPeriodService = require('../services/notifications/setup/submit-returns-period.service.js')

const basePath = 'notifications/setup'

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

async function viewCancel(request, h) {
  const { sessionId } = request.params

  const pageData = await CancelService.go(sessionId)

  return h.view(`${basePath}/cancel.njk`, pageData)
}

async function viewConfirmation(request, h) {
  const { eventId } = request.params

  const pageData = await ConfirmationService.go(eventId)

  return h.view(`${basePath}/confirmation.njk`, pageData)
}

async function viewLicence(request, h) {
  const { sessionId } = request.params

  const pageData = await AdHocLicenceService.go(sessionId)

  return h.view(`${basePath}/ad-hoc-licence.njk`, pageData)
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

async function setup(request, h) {
  const { journey } = request.query

  const { sessionId, path } = await InitiateSessionService.go(journey)

  return h.redirect(`/system/${basePath}/${sessionId}/${path}`)
}

async function submitCancel(request, h) {
  const { sessionId } = request.params

  await SubmitCancelService.go(sessionId)

  return h.redirect(`/manage`)
}

async function submitCheck(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const eventId = await SubmitCheckService.go(sessionId, auth)

  return h.redirect(`/system/${basePath}/${eventId}/confirmation`)
}

async function submitLicence(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitAdHocLicenceService.go(sessionId, request.payload)

  if (pageData.error || pageData.notification) {
    return h.view(`${basePath}/ad-hoc-licence.njk`, pageData)
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
  viewCancel,
  viewConfirmation,
  viewLicence,
  viewCheck,
  viewRemoveLicences,
  viewReturnsPeriod,
  setup,
  submitCancel,
  submitCheck,
  submitLicence,
  submitRemoveLicences,
  submitReturnsPeriod
}
