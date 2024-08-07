'use strict'

const LegacyImportLicenceService = require('../services/import/legacy-licence.service.js')
const FeatureFlags = require('../../config/feature-flags.config.js')
const Boom = require('@hapi/boom')

/**
 * Controller for /import
 * @module ImportController
 */
async function licence (request, h) {
  try {
    const { licenceRef } = request.payload

    if (FeatureFlags.enableSystemImportLegacyLicence) {
      await LegacyImportLicenceService.go(licenceRef)
    }

    return h.response().code(204)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

module.exports = {
  licence
}
