'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const InitiateReturnRequirementSessionService = require('../services/return-requirements/initiate-return-requirement-session.service.js')

async function noReturnsRequired (request, h) {
  const { id } = request.params

  const session = await InitiateReturnRequirementSessionService.go(id)

  return h.redirect(`/system/return-requirements/${session.id}/start-date`)
}

module.exports = {
  noReturnsRequired
}
