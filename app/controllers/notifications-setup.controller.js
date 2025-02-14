'use strict'

/**
 * Controller for /notifications/setup endpoints
 * @module NotificationsSetupController
 */

const DownloadRecipientsService = require('../services/notifications/setup/download-recipients.service.js')
const InitiateSessionService = require('../services/notifications/setup/initiate-session.service.js')
const AdHocLicenceService = require('../services/notifications/setup/ad-hoc-licence.service.js')
const RemoveLicencesService = require('../services/notifications/setup/remove-licences.service.js')
const ReturnsPeriodService = require('../services/notifications/setup/returns-period.service.js')
const CheckService = require('../services/notifications/setup/check.service.js')
const SubmitAdHocLicenceService = require('../services/notifications/setup/submit-ad-hoc-licence.service.js')
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
  viewLicence,
  viewCheck,
  viewRemoveLicences,
  viewReturnsPeriod,
  setup,
  submitLicence,
  submitRemoveLicences,
  submitReturnsPeriod
}
