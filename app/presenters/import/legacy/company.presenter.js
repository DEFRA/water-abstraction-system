'use strict'

/**
 * Maps the legacy NALD company data to the WRLS format
 * @module CompanyPresenter
 */

/**
 * Maps the legacy NALD company data to the WRLS format
 *
 * @param {ImportLegacyCompanyType} company - the legacy NALD company
 *
 * @returns {object} the NALD company data transformed into the WRLS format for a company
 * ready for validation and persisting
 */
function go (company) {
  return {
    name: company.name,
    type: company.type,
    externalId: company.external_id,
    addresses: [],
    companyAddresses: []
  }
}

module.exports = {
  go
}
