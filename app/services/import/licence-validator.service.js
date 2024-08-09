'use strict'

/**
 * Validates a import licence object
 * @module ImportLicenceValidatorService
 */

const ImportLicenceValidator = require('../../validators/import/licence.validator.js')
const ImportLicenceVersionsValidator = require('../../validators/import/licence-versions.validator.js')

/**
 * Validates an import licence is in the correct shape and format to persist in the database
 *
 * If the validation fails throw an error
 *
 * @param {object} licence - The licence to validate
 * @param {object[]} licenceVersions - The licence versions to validate
 */
function go (licence, licenceVersions) {
  ImportLicenceValidator.go(licence)
  ImportLicenceVersionsValidator.go(licenceVersions)
}

module.exports = {
  go
}
