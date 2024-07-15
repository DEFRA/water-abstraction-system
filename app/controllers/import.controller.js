'use strict'

const LegacyLicenceService = require('../services/import/legacy-licence.service.js')

/**
 * Controller for /import
 * @module ImportController
 */
async function licence (request, h) {
  const { licenceRef } = request.payload

  await LegacyLicenceService.go(licenceRef)

  return h.response().code(204)
}

module.exports = {
  licence
}
