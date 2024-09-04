'use strict'

/**
 * Maps the legacy NALD parties data to the WRLS format for a company
 * @module CompaniesPresenter
 */

/**
 * Maps the legacy NALD parties data to the WRLS format for a company
 *
 * We use the licence roles to get the companies. These roles may have different addresses but the same
 * company id (party_id).
 *
 * We will remove duplicates of the party id to reduce unnecessary inserts into the database.
 *
 * @param {ImportLegacyCompaniesType[]} companies - the legacy NALD companies
 *
 * @returns {object[]} the NALD companies data transformed into the WRLS format for a company
 * ready for validation and persisting
 */
function go (companies) {
  // need to remove duplicates
  return companies.map((company) => {
    return {
      name: company.name,
      type: company.type,
      externalId: company.external_id
    }
  })
}

module.exports = {
  go
}
