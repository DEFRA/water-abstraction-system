'use strict'

const ImportLicenceService = require('../services/import/licence.service.js')

/**
 * Controller for /import
 * @module ImportController
 */
async function licence (request, h) {
  const { licenceRef } = request.payload

  await ImportLicenceService.go(licenceRef)

  return h.response().code(204)
}

module.exports = {
  licence
}
