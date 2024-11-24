'use strict'

const FeatureFlags = require('../../config/feature-flags.config.js')
const ImportLegacyProcessLicenceService = require('../services/import/legacy/process-licence.service.js')

/**
 * Controller for /import
 * @param request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {object}
 *
 * @module ImportController
 */
async function licenceLegacy(request, h) {
  const { licenceRef } = request.payload

  if (FeatureFlags.enableSystemImportLegacyLicence) {
    ImportLegacyProcessLicenceService.go(licenceRef)
  }

  return h.response().code(204)
}

module.exports = {
  licenceLegacy
}
