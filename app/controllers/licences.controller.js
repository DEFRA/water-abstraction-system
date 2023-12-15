'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const SessionModel = require('../models/session.model.js')

async function noReturnsRequired (request, h) {
  const { id } = request.params

  const session = SessionModel.query()
    .insert({
      licenceId: id
    })
    .returning('*')

  return h.redirect(`/system/return-requirements/${session.id}/no-returns-required`)
}

module.exports = {
  noReturnsRequired
}
