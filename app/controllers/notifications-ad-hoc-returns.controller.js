'use strict'

/**
 * Controller for /notifications/ad-hoc-returns endpoints
 * @module NotificationsAdHocReturnsController
 */

const SubmitLicenceService = require('../services/notifications/ad-hoc-returns/submit-licence.service.js')

const basePath = 'notifications/ad-hoc-returns'

async function licence(_request, h) {
  return h.view(`${basePath}/licence.njk`, {
    activeNavBar: 'manage',
    pageTitle: 'Enter a licence number'
  })
}

async function submitLicence(request, h) {
  const pageData = await SubmitLicenceService.go(request.payload)

  if (pageData.error || pageData.notification) {
    return h.view(`${basePath}/licence.njk`, pageData)
  }

  // Temporarily keep the user on the same page until the next page is built
  return h.view(`${basePath}/licence.njk`, {
    activeNavBar: 'manage',
    pageTitle: 'Enter a licence number'
  })
}

module.exports = {
  licence,
  submitLicence
}
