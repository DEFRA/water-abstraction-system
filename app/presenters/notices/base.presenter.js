'use strict'

const NotifyAddressPresenter = require('./setup/notify-address.presenter.js')
const { today } = require('../../lib/general.lib.js')
const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats an address object into a fixed array of 7 strings to be used as a CSV.
 *
 * When an address has less than 7 address lines, we fill the remaining lines with empty strings to maintain the
 * integrity of the CSV.
 *
 * ```javascript
 * // Full address
 * ['Mr H J Potter', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR', 'UK']
 *
 * // Address missing some lines
 * ['Mr H J Potter', '1', 'Privet Drive', 'Little Whinging', 'WD25 7LR', '', '']
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
 * Determines the due date for a notification
 *
 * This is determined by the business to be 'today' plus 28 days for email, and 29 days for letters. For example, if
 * today is 2025-11-01 then
 *
 * - Email due date is 2025-11-29
 * - Letter due date is 2025-11-30
 *
 * The extra day for letters is to allow the extra time it takes Notify to send the letter for printing and mailing.
 *
 *
 * @param {string} [messageType=email] - Either 'letter' or 'email'. Defaults to 'email'.
 *
 * @returns {Date} A date either 28 or 29 days from 'today'
 */
function futureDueDate(messageType = 'email') {
  const dueDate = today()
  const daysToAdd = messageType === 'letter' ? 29 : 28

  dueDate.setDate(dueDate.getDate() + daysToAdd)

  return dueDate
}

/**
 * A return period is made up of a start and end date.
 *
 * When we display the return period, we need to show the users a prefix to indicate the type of return period.
 *
 * @param {object} returnsPeriod - the saved returns period
 *
 * @returns {string} - the display text for the returns period
 */
function returnsPeriodText(returnsPeriod) {
  const textPrefix = _returnsPeriodTextPrefix(returnsPeriod)

  return `${textPrefix} ${formatLongDate(returnsPeriod.startDate)} to ${formatLongDate(returnsPeriod.endDate)}`
}

function _returnsPeriodTextPrefix(returnPeriod) {
  if (returnPeriod.name === 'allYear') {
    return 'Winter and all year annual'
  }

  if (returnPeriod.name === 'summer') {
    return 'Summer annual'
  }

  return 'Quarterly'
}

module.exports = {
  addressToCSV,
  futureDueDate,
  returnsPeriodText
}
