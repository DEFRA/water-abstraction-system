'use strict'

/**
 * Formats data for the '/companies/{id}' page
 * @module CompanyPresenter
 */

/**
 * Formats data for the '/companies/{id}' page
 *
 * @param {module:CompanyModel} companyDetails - The company details
 * @param {string} role - the role in sentence case
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
    pageTitle: role,
    pageTitleCaption: companyName,
    details: {
      name: companyName,
      address: _formatCompanyAddress(companyAddress)
    }
  }
}

function _formatCompanyAddress(companyAddress) {
  const { id: _, ...addressLines } = companyAddress.address

  return Object.values(addressLines)
}

module.exports = {
  go
}
