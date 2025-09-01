'use strict'

const NotifyAddressPresenter = require('./setup/notify-address.presenter.js')

/**
 * Formats an address into as CSV string.
 *
 * When there is noaddress then return empty csv values.
 *
 * @param {object} address
 *
 * @returns {string[]} - a CSV string of empty fields or the address lines
 */
function addressToCSV(address) {
  if (!address) {
    return ['', '', '', '', '', '', '']
  }

  const notifyAddress = NotifyAddressPresenter.go(address)

  return [
    notifyAddress.address_line_1,
    notifyAddress.address_line_2 || '',
    notifyAddress.address_line_3 || '',
    notifyAddress.address_line_4 || '',
    notifyAddress.address_line_5 || '',
    notifyAddress.address_line_6 || '',
    notifyAddress.address_line_7 || ''
  ]
}

module.exports = {
  addressToCSV
}
