'use strict'

/**
 * Maps the legacy NALD address data to the WRLS format
 * @module CompanyAddressPresenter
 */

/**
 * Maps the legacy NALD address data to the WRLS format
 *
 * @param {ImportLegacyCompanyAddressType} address - the legacy NALD address
 *
 * @returns {object} the NALD company data transformed into the WRLS format for an address
 * ready for validation and persisting
 */
function go (address) {
  return {
    addressId: address.external_id,
    companyId: address.company_external_id,
    licenceRoleId: address.licence_role_id,
    startDate: address.start_date,
    endDate: address.licence_role_name === 'licenceHolder' ? _endDate(address) : address.end_date
  }
}

/**
 * Calculate the licence holders address end date
 *
 * A licence can have multiple versions, when one licence version ends the other should start.
 *
 * We want the earliest end date, expiry date, lapsed date or revoked date
 *
 * @param {ImportLegacyCompanyAddressType} address - the legacy NALD address
 *
 * @returns {date | null} the end date for a licence holder
 * @private
 */
function _endDate (address) {
  const date = [address.end_date, address.lapsed_date, address.expired_date, address.revoked_date]
    .filter((date) => { return date })
    .sort((date1, date2) => { return date1 - date2 })
    .slice(-1)[0]

  return date || null
}

module.exports = {
  go
}
