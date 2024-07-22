'use strict'

/**
 * Validates a import licence object
 * @module ImportLicenceValidatorService
 */

const ImportLicenceValidator = require('../../validators/import/licence.validator.js')
const ImportLicenceVersionsValidator = require('../../validators/import/licence-versions.validator.js')

/**
 * Validates a import licence is in the correct shape and format to persist in the database
 *
 * If the validation fails throw an error
 *
 * @param {ImportLicenceType} licence - The licence to validate
 * @param {ImportLicenceVersionType[]} licenceVersions - The licence versions to validate
 */
function go (licence, licenceVersions) {
  ImportLicenceValidator.go(licence)
  ImportLicenceVersionsValidator.go(licenceVersions)
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
 * @property {ImportRegionType} regions
 * @property {string | null} revokedDate
 * @property {string} startDate
 * @property {boolean} waterUndertaker
 */

/**
 * A valid licence 'regions' json colum
 * @typedef {Object} ImportRegionType
 *
 * @property {string} regionalChargeArea
 * @property {string} localEnvironmentAgencyPlanCode
 * @property {string} historicalAreaCode
 * @property {string} standardUnitChargeCode
 *
 */

/**
 * @typedef {Object} ImportLicenceVersionPurposeType
 *
 * @property {number} abstractionPeriodEndDay - The end day of the abstraction period.
 * @property {number} abstractionPeriodEndMonth - The end month of the abstraction period.
 * @property {number} abstractionPeriodStartDay - The start day of the abstraction period.
 * @property {number} abstractionPeriodStartMonth - The start month of the abstraction period.
 * @property {number|null} annualQuantity - The annual quantity; null if not applicable.
 * @property {number|null} dailyQuantity - The daily quantity; null if not applicable.
 * @property {string} externalId - The external identifier for the purpose.
 * @property {number|null} hourlyQuantity - The hourly quantity; null if not applicable.
 * @property {number|null} instantQuantity - The instant quantity; null if not applicable.
 * @property {string|null} notes - Additional notes; null if not applicable.
 * @property {string} primaryPurposeId - The primary purpose identifier.
 * @property {string} secondaryPurposeId - The secondary purpose identifier.
 * @property {string} purposeId - The purpose identifier.
 * @property {string|null} timeLimitedEndDate - The end date of the time-limited period in ISO format;
 * null if not applicable.
 * @property {string|null} timeLimitedStartDate - The start date of the time-limited period in ISO format;
 * null if not applicable.
 */

/**
 * @typedef {Object} ImportLicenceVersionType
 *
 * @property {string} createdAt - The creation timestamp in ISO format.
 * @property {string|null} endDate - The end date in ISO format; null if not applicable.
 * @property {string} externalId - The external identifier for the licence version.
 * @property {number} increment - The increment number.
 * @property {number} issue - The issue number.
 * @property {string|null} startDate - The start date in ISO format; null if not applicable.
 * @property {string} status - The status of the licence version.
 * @property {string} updatedAt - The update timestamp in ISO format.
 * @property {ImportLicenceVersionPurposeType[]} purposes - The array of purposes associated with the licence version.
 */
