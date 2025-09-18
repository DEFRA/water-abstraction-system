'use strict'

const NotifyAddressPresenter = require('./setup/notify-address.presenter.js')

/**
 * Formats an address object into a fixed array of 7 strings to be used as a CSV.
 *
 * When an address has less than 7 address lines, we fill the remaining lines with empty strings to maintain the
 * integrity of the CSV.
 *
 * ```javascript
 * // Full address
 * ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR', 'UK']
 *
 * // Address missing some lines
 * ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'WD25 7LR', '', '']
 * ```
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

/**
 * Provides a date in the future for a due date.
 *
 * This is determined by the business to be 28 days from 'today'.
 *
 * When the 'messageType' is a 'letter', then we allow an additional day.
 *
 * @param {string} [messageType] - Should be either 'letter' or 'email'
 *
 * @returns {Date} - A date either 28 or 29 days from the 'today'
 */
function futureDueDate(messageType) {
  const dueDate = new Date()
  const twentyEightDays = 28 // The days to add when sending an email
  const twentyNineDays = 29 // The days to add when sending a letter

  const daysToAdd = messageType === 'letter' ? twentyNineDays : twentyEightDays
  dueDate.setDate(dueDate.getDate() + daysToAdd)

  return dueDate
}

module.exports = {
  addressToCSV,
  futureDueDate
}
