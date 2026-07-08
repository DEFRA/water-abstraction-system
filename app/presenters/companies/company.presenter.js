/**
 * Formats data for the '/companies/{id}/{role}' page
 * @module CompanyPresenter
 */

import { formatLongDate } from '../../presenters/base.presenter.js'
import { roles } from '../../lib/static-lookups.lib.js'

/**
 * Formats data for the '/companies/{id}/{role}' page
 *
 * @param {module:CompanyModel} companyDetails - The company details
 * @param {string} role - the role
 *
 * @returns {object} The data formatted for the view template
 */
export default function go(companyDetails, role) {
  const { name: companyName, id: companyId, companyAddresses } = companyDetails

  return {
    backLink: {
      href: `/system/companies/${companyId}/contacts`,
      text: 'Go back to licence holder contacts'
    },
    companyAddresses: _companyAddresses(companyAddresses),
    pageTitle: roles[role].label,
    pageTitleCaption: companyName
  }
}

function _address(companyAddress) {
  const { address } = companyAddress

  return [
    address.address1,
    address.address2,
    address.address3,
    address.address4,
    address.address5,
    address.address6,
    address.postcode,
    address.country
  ].filter(Boolean)
}

function _companyAddresses(companyAddresses) {
  return companyAddresses.map((companyAddress) => {
    return {
      address: _address(companyAddress),
      startDate: formatLongDate(companyAddress.startDate),
      endDate: companyAddress.endDate ? formatLongDate(companyAddress.endDate) : null
    }
  })
}
