'use strict'

/**
 * Controller for /notifications/ad-hoc-returns endpoints
 * @module NotificationsAdHocReturnsController
 */

const LicenceService = require('../services/notifications/ad-hoc-returns/licence.service.js')
const SubmitLicenceService = require('../services/notifications/ad-hoc-returns/submit-licence.service.js')

const basePath = 'notifications/ad-hoc-returns'

async function licence(request, h) {
  const { sessionId } = request.params

  const pageData = await LicenceService.go(sessionId)

  return h.view(`${basePath}/licence.njk`, pageData)
}

async function submitLicence(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitLicenceService.go(sessionId, request.payload)

  if (pageData.error || pageData.notification) {
    return h.view(`${basePath}/licence.njk`, pageData)
  }

  return h.redirect(`/system/${basePath}/${sessionId}/check-returns`)
}

module.exports = {
  licence,
  submitLicence
}
