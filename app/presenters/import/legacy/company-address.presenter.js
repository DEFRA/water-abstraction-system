'use strict'

/**
 * Maps the legacy NALD data to a company address
 * @module CompanyAddressPresenter
 */

/**
 * Maps the legacy NALD data to a company address
 *
 * @param {ImportLegacyCompanyAddressType} address - the legacy NALD data in company address format
 *
 * @returns {object} the NALD company address data transformed into the WRLS format for a company address
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
 * Calculate the licence holders company address end date
 *
 * A licence can have multiple versions, when one licence version ends the other should start.
 *
 * Unless a licence has not ended then the end date can be null to show it has not ended
 *
 * A licence can be ended, revoked, lapsed or expired. When this is the case we want to the oldest date of the options.
 *
 * @param {ImportLegacyCompanyAddressType} address - the legacy NALD address
 *
 * @returns {date | null} the end date for a licence holder
 * @private
 */
function _endDate (address) {
  const endDates = [
    address.end_date,
    address.lapsed_date,
    address.expired_date,
    address.revoked_date
  ].filter((endDate) => {
    return endDate
  })

  const oldestDate = new Date(Math.max(...endDates))

  return !isNaN(oldestDate) ? oldestDate : null
}

module.exports = {
  go
}
