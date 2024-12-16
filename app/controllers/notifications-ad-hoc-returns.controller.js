'use strict'

/**
 * Controller for /notifications/ad-hoc-returns endpoints
 * @module NotificationsAdHocReturnsController
 */

const InitiateSessionService = require('../services/notifications/ad-hoc-returns/initiate-session.service.js')
const LicenceService = require('../services/notifications/ad-hoc-returns/licence.service.js')
const SubmitLicenceService = require('../services/notifications/ad-hoc-returns/submit-licence.service.js')

const basePath = 'notifications/ad-hoc-returns'

async function licence(request, h) {
  const { sessionId } = request.params

  const pageData = await LicenceService.go(sessionId)

  return h.view(`${basePath}/licence.njk`, {
    activeNavBar: 'manage',
    pageTitle: 'Enter a licence number',
    ...pageData
  })
}

async function setup(_request, h) {
  const session = await InitiateSessionService.go()

  return h.redirect(`/system/${basePath}/${session.id}/licence`)
}

async function submitLicence(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitLicenceService.go(sessionId, request.payload)

  if (pageData.error || pageData.notification) {
    return h.view(`${basePath}/licence.njk`, {
      activeNavBar: 'manage',
      pageTitle: 'Enter a licence number',
      ...pageData
    })
  }

  return h.redirect(`/system/${basePath}/${sessionId}/check-returns`)
}

module.exports = {
  licence,
  setup,
  submitLicence
}
