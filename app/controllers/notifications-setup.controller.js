'use strict'

/**
 * Controller for /notifications/setup endpoints
 * @module NotificationsSetupController
 */

const DownloadRecipientsService = require('../services/notifications/setup/download-recipients.service.js')
const InitiateSessionService = require('../services/notifications/setup/initiate-session.service.js')
const RemoveLicencesService = require('../services/notifications/setup/remove-licences.service.js')
const ReturnsPeriodService = require('../services/notifications/setup/returns-period.service.js')
const ReviewService = require('../services/notifications/setup/review.service.js')
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

async function viewReview(request, h) {
  const {
    params: { sessionId },
    query: { page }
  } = request

  const pageData = await ReviewService.go(sessionId, page)

  return h.view(`${basePath}/review.njk`, pageData)
}

async function setup(request, h) {
  const { journey } = request.query

  const { sessionId, path } = await InitiateSessionService.go(journey)

  return h.redirect(`/system/${basePath}/${sessionId}/${path}`)
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
  viewRemoveLicences,
  viewReturnsPeriod,
  viewReview,
  setup,
  submitRemoveLicences,
  submitReturnsPeriod
}
