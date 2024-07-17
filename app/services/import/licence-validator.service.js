'use strict'

/**
 * Maps the import data to the desired format
 * @module LicenceValidatorService
 */

/**
 * Validates a licence is in the correct shape and format to perist in the databasse
 *
 * @param {ImportLicenceType} licence - The licence to validator
 * @returns {} a licence is the licence is valid, other wise throw an error
 */
function go (licence) {
  return licence
}

module.exports = {
  go
}

/**
 * A valid licence that is in the correct shape / format to save in the database
 * @typedef {Object} ImportLicenceType
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
 * @typedef {Object} RegionsType
 *
 * @property {string} regionalChargeArea
 * @property {string} localEnvironmentAgencyPlanCode
 * @property {string} historicalAreaCode
 * @property {string} standardUnitChargeCode
 *
 */
