'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const InitiateReturnRequirementSessionService = require('../services/return-requirements/initiate-return-requirement-session.service.js')
const ViewLicenceService = require('../services/licences/view-licence.service.js')

async function noReturnsRequired (request, h) {
  const { id } = request.params

  const session = await InitiateReturnRequirementSessionService.go(id)

  return h.redirect(`/system/return-requirements/${session.id}/select-return-start-date`)
}

async function summary (request, h) {
  const { id } = request.params

  const data = await ViewLicenceService.go(id)

  return h.view('view-licences/licence.njk', {
    activeNavBar: 'search',
    ...data
  })
}

module.exports = {
  noReturnsRequired,
  summary
}
