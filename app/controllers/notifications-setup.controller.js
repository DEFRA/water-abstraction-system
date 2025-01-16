'use strict'

const ReturnsPeriodService = require('../services/notifications/setup/returns-period.service.js')
const ReviewService = require('../services/notifications/setup/review.service.js')
const SubmitReturnsPeriodService = require('../services/notifications/setup/submit-returns-period.service.js')
const InitiateSessionService = require('../services/notifications/setup/initiate-session.service.js')

/**
 * Controller for /notifications/setup endpoints
 * @module NotificationsSetupController
 */

const basePath = 'notifications/setup'

async function viewReturnsPeriod(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ReturnsPeriodService.go(sessionId)

  return h.view(`${basePath}/view-returns-period.njk`, pageData)
}

async function viewReview(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ReviewService.go(sessionId)

  return h.view(`${basePath}/review.njk`, pageData)
}

async function setup(_request, h) {
  const session = await InitiateSessionService.go()

  return h.redirect(`/system/${basePath}/${session.id}/returns-period`)
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
  viewReturnsPeriod,
  viewReview,
  setup,
  submitReturnsPeriod
}
