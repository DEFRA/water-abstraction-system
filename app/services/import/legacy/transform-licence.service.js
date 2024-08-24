'use strict'

/**
 * Transforms NALD licence data into a valid object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceService
 */

const FetchLicenceService = require('./fetch-licence.service.js')
const LicencePresenter = require('../../../presenters/import/legacy/licence.presenter.js')
const LicenceValidator = require('../../../validators/import/licence.validator.js')

/**
 * Transforms NALD licence data into a validated object that matches the WRLS structure
 *
 * @param {string} licenceRef - The reference of the licence to be imported from NALD
 *
 * @returns {Promise<object>} an object representing a valid WRLS licence
 */
async function go (licenceRef) {
  const naldLicence = await FetchLicenceService.go(licenceRef)

  const transformedLicence = LicencePresenter.go(naldLicence)

  LicenceValidator.go(transformedLicence)

  // Add an empty array property ready for when transforming and attaching licence versions
  transformedLicence.licenceVersions = []

  return {
    naldLicenceId: naldLicence.id,
    regionCode: naldLicence.region_code,
    transformedLicence
  }
}

module.exports = {
  go
}
