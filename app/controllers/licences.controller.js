'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const InitiateReturnRequirementSessionService = require('../services/return-requirements/initiate-return-requirement-session.service.js')

async function noReturnsRequired (request, h) {
  const { id } = request.params

  const sessionId = await InitiateReturnRequirementSessionService.go(id)

  return h.redirect(`/system/return-requirements/${sessionId}/select-return-start-date`)
}

module.exports = {
  noReturnsRequired
}
