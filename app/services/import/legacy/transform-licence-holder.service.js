'use strict'

/**
 * Transforms NALD licence holder data into a valid object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceHolderService
 */

const FetchLicenceHolderService = require('./fetch-licence-holders.service.js')
const LicenceHolderPresenter = require('../../../presenters/import/legacy/licence-holder.presenter.js')
const ImportLicenceHolderValidator = require('../../../validators/import/licence-holder.validator.js')

/**
 * Transforms NALD licence holder data into a validated object that matches the WRLS structure
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 * @param {object[]} transformedCompanies
 *
 * @returns {Promise<object>} an object representing an array of valid WRLS transformed companies
 */
async function go (regionCode, licenceId, transformedCompanies) {
  const naldLicenceHolders = await FetchLicenceHolderService.go(regionCode, licenceId)

  naldLicenceHolders.forEach((licenceHolder) => {
    const matchingLicenceHolder = _matchingCompanyForLicenceHolder(transformedCompanies, licenceHolder)

    const transformedLicenceHolder = LicenceHolderPresenter.go(licenceHolder)

    ImportLicenceHolderValidator.go(transformedLicenceHolder)

    matchingLicenceHolder.licenceHolder = transformedLicenceHolder
  })
}

function _matchingCompanyForLicenceHolder (transformedCompanies, licenceHolder) {
  return transformedCompanies.find((company) => {
    return company.externalId === licenceHolder.company_external_id
  })
}

module.exports = {
  go
}
