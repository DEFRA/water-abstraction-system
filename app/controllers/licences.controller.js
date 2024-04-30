'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const InitiateReturnRequirementSessionService = require('../services/return-requirements/initiate-return-requirement-session.service.js')
const ViewLicenceService = require('../services/licences/view-licence.service.js')

async function noReturnsRequired (request, h) {
  const { id } = request.params

  const session = await InitiateReturnRequirementSessionService.go(id, 'no-returns-required')

  return h.redirect(`/system/return-requirements/${session.id}/start-date`)
}

async function returnsRequired (request, h) {
  const { id } = request.params

  const session = await InitiateReturnRequirementSessionService.go(id, 'returns-required')

  return h.redirect(`/system/return-requirements/${session.id}/start-date`)
}

async function viewSummary (request, h) {
  const { params: { id }, auth } = request

  const data = await ViewLicenceService.go(id, auth)

  return h.view('licences/view.njk', {
    activeNavBar: 'search',
    activeTab: 'summary',
    ...data
  })
}

module.exports = {
  noReturnsRequired,
  returnsRequired,
  viewSummary
}
