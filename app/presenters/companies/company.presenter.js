'use strict'

/**
 * Formats data for the '/companies/{id}/{role}' page
 * @module CompanyPresenter
 */

const { roles } = require('../../lib/static-lookups.lib.js')

/**
 * Formats data for the '/companies/{id}/{role}' page
 *
 * @param {module:CompanyModel} companyDetails - The company details
 * @param {string} role - the role
 *
 * @returns {object} The data formatted for the view template
 */
function go(companyDetails, role) {
  const {
    name: companyName,
    id: companyId,
    companyAddresses: [companyAddress]
  } = companyDetails

  return {
    backLink: {
      href: `/system/companies/${companyId}/contacts`,
      text: 'Go back to contacts'
    },
    pageTitle: roles[role].label,
    pageTitleCaption: companyName,
    details: {
      name: companyName,
      address: _formatCompanyAddress(companyAddress)
    }
  }
}

function _formatCompanyAddress(companyAddress) {
  const { address } = companyAddress

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
