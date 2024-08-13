'use strict'

const FeatureFlags = require('../../config/feature-flags.config.js')
const ImportLegacyProcessLicenceService = require('../services/import/legacy/process-licence.service.js')

/**
 * Controller for /import
 * @module ImportController
 */
async function licence (request, h) {
  const { licenceRef } = request.payload

  if (FeatureFlags.enableSystemImportLegacyLicence) {
    ImportLegacyProcessLicenceService.go(licenceRef)
  }

  return h.response().code(204)
}

module.exports = {
  licence
}
