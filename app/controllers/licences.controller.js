'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const SessionModel = require('../models/session.model.js')

async function noReturnsRequired (request, h) {
  const { id } = request.params

  const data = { licenceId: id }
  const session = await SessionModel.query()
    .insert({
      data
    })
    .returning('*')

  return h.redirect(`/system/return-requirements/${session.id}/select-return-start-date`)
}

module.exports = {
  noReturnsRequired
}
