'use strict'

const LegacyImportLicenceService = require('../services/import/legacy-licence.service.js')
const Boom = require('@hapi/boom')

/**
 * Controller for /import
 * @module ImportController
 */
async function licence (request, h) {
  const { licenceRef } = request.payload

  try {
    await LegacyImportLicenceService.go(licenceRef)

    return h.response().code(204)
  } catch (error) {
    return Boom.badImplementation(`Licence ref: ${licenceRef} failed with error - ${error.message}`)
  }
}

module.exports = {
  licence
}
