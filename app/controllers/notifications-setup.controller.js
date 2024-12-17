'use strict'

const ReturnsPeriodService = require('../services/notifications/setup/returns-period.service.js')
const SubmitReturnsPeriodService = require('../services/notifications/setup/submit-returns-period.service.js')
const InitiateSessionService = require('../services/notifications/setup/initiate-session.service')

/**
 * Controller for /notifications/setup endpoints
 * @module NotificationsSetupController
 */

const basePath = 'notifications/setup'

async function viewReturnsPeriod(_request, h) {
  const pageData = ReturnsPeriodService.go()

  return h.view(`${basePath}/view-returns-period.njk`, {
    ...pageData
  })
}

async function setup(_request, h) {
  const session = await InitiateSessionService.go()

  return h.redirect(`/system/${basePath}/${session.id}/returns-period`)
}

async function submitReturnsPeriod(request, h) {
  const { payload } = request

  const pageData = await SubmitReturnsPeriodService.go(payload)

  if (pageData.error) {
    return h.view(`${basePath}/view-returns-period.njk`, {
      ...pageData
    })
  }

  return h.redirect(`/system/${basePath}/${pageData.redirect}`)
}

module.exports = {
  viewReturnsPeriod,
  setup,
  submitReturnsPeriod
}
