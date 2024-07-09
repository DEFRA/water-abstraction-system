'use strict'

const ImportLicenceHandler = require('./licence/services/import-licence.service.js')

/**
 * Controller for /import endpoints
 * @module ImportController
 */
async function LicenceTrigger (request, h) {
  const { licenceRef } = request.payload

  console.log('Licence Ref', licenceRef)

  await ImportLicenceHandler.go(licenceRef)

  return h.response().code(204)
}

module.exports = {
  LicenceTrigger
}
