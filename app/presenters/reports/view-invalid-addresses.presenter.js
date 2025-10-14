'use strict'

/**
 * Formats return invalid addresses data ready for presenting in the view invalid addresses page
 * @module ViewInvalidAddressesPresenter
 */

const { formatDateObjectToISO } = require('../../lib/dates.lib.js')

/**
 * Formats return invalid addresses data ready for presenting in the view invalid addresses page
 *
 * @param {Array} invalidAddresses - The invalid addresses data
 *
 * @returns {object} page data needed by the view template
 */
function go(invalidAddresses) {
  return {
    backLink: { href: '/system/manage', text: 'Back' },
    invalidAddresses: _formatTableData(invalidAddresses),
    pageTitle: 'Invalid addresses'
  }
}

function _formatTableData(data) {
  return data.map((address) => {
    const addressLines = [
      `Address Line 1: ${address.address_line_1 ? address.address_line_1 : ''}`,
      `Address Line 2: ${address.address_line_2 ? address.address_line_2 : ''}`,
      `Address Line 3: ${address.address_line_3 ? address.address_line_3 : ''}`,
      `Address Line 4: ${address.address_line_4 ? address.address_line_4 : ''}`,
      `County: ${address.county ? address.county : ''}`,
      `Town: ${address.town ? address.town : ''}`
    ]

    return {
      licenceRef: address.licence_ref,
      licenceEnds: formatDateObjectToISO(address.licence_ends),
      contactRole: address.contact_role,
      addressLines
    }
  })
}

module.exports = {
  go
}
