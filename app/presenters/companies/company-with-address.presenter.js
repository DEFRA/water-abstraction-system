'use strict'

/**
 * Formats data for the '/companies/{id}/address/{addressId}/{role}' page
 * @module CompanyPresenter
 */

const { roles } = require('../../lib/static-lookups.lib.js')

/**
 * Formats data for the '/companies/{id}/address/{addressId}/{role}' page
 *
 * @param {module:CompanyModel} company - The company data
 * @param {module:AddressModel} address - The address data
 * @param {string} role - the role in kebab-case
 * @param {string} licenceId - the UUID of the licence the user was viewing or null if unknown
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, address, role, licenceId) {
  const { id: companyId, name: companyName } = company

  return {
    backLink: _backLink(companyId, licenceId),
    pageTitle: roles[role].label,
    pageTitleCaption: companyName,
    details: {
      name: companyName,
      address: _formatCompanyAddress(address)
    }
  }
}

function _backLink(companyId, licenceId) {
  if (licenceId) {
    return {
      href: `/system/licences/${licenceId}/contact-details`,
      text: 'Go back to licence contact details'
    }
  }

  return {
    href: `/system/companies/${companyId}/contacts`,
    text: 'Go back to licence holder contacts'
  }
}

function _formatCompanyAddress(address) {
  return [
    address.address1,
    address.address2,
    address.address3,
    address.address4,
    address.address5,
    address.postcode,
    address.country
  ].filter(Boolean)
}

module.exports = {
  go
}
