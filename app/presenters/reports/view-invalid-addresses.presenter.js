'use strict'

/**
 * Formats return invalid addresses data ready for presenting in the view invalid addresses page
 * @module ViewInvalidAddressesPresenter
 */

const { formatDateObjectToISO } = require('../../lib/dates.lib.js')

/**
 * Formats return invalid addresses data ready for presenting in the view invalid addresses page
 *
 * @param {object[]} invalidAddresses - The invalid addresses data
 *
 * @returns {object} page data needed by the view template
 */
function go(invalidAddresses) {
  return {
    backLink: { href: '/system/manage', text: 'Go back to manage' },
    invalidAddresses: _formatTableData(invalidAddresses),
    pageTitle: 'Invalid addresses',
    tableCaption: `Showing ${invalidAddresses.length} invalid addresses`
  }
}

function _formatTableData(data) {
  return data.map((address) => {
    const addressLines = [
      `Address Line 1: ${_line(address.address_line_1)}`,
      `Address Line 2: ${_line(address.address_line_2)}`,
      `Address Line 3: ${_line(address.address_line_3)}`,
      `Address Line 4: ${_line(address.address_line_4)}`,
      `County: ${_line(address.county)}`,
      `Town: ${_line(address.town)}`
    ]

    return {
      licenceRef: address.licence_ref,
      licenceEnds: formatDateObjectToISO(address.licence_ends),
      contactRole: address.contact_role,
      addressLines
    }
  })
}

function _line(addressLine) {
  return addressLine ?? ''
}

module.exports = {
  go
}
