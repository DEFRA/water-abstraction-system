'use strict'

const LegacyImportLicenceService = require('../services/import/legacy-licence.service.js')

/**
 * Controller for /import
 * @module ImportController
 */
async function licence (request, h) {
  const { licenceRef } = request.payload

  await LegacyImportLicenceService.go(licenceRef)

  return h.response().code(204)
}

module.exports = {
  licence
}
