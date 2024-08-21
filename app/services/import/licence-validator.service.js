'use strict'

/**
 * Validates a licence object
 * @module ImportLicenceValidatorService
 */

const ImportLicenceValidator = require('../../validators/import/licence.validator.js')

/**
 * Validates a licence is in the correct shape and format to persist in the database
 *
 * If the validation fails throw an error
 *
 * @param {ImportLicenceType} licence - The licence to validator
 */
function go (licence) {
  ImportLicenceValidator.go(licence)
}

module.exports = {
  go
}

/**
 * A valid licence that is in the correct shape / format to save in the database
 * @typedef {object} ImportLicenceType
 *
 * @property {string | null} expiredDate
 * @property {string | null} lapsedDate
 * @property {string} licenceRef
 * @property {number} naldRegionId
 * @property {RegionsType} regions
 * @property {string | null} revokedDate
 * @property {string} startDate
 * @property {boolean} waterUndertaker
 */

/**
 * A valid licence 'regions' json colum
 * @typedef {object} RegionsType
 *
 * @property {string} regionalChargeArea
 * @property {string} localEnvironmentAgencyPlanCode
 * @property {string} historicalAreaCode
 * @property {string} standardUnitChargeCode
 *
 */
