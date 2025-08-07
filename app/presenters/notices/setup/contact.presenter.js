'use strict'

/**
 * Formats a recipient into a contact
 * @module ContactPresenter
 */

const NotifyAddressPresenter = require('./notify-address.presenter.js')

/**
 * Formats a recipient into a contact
 *
 * Contact can be an email or an address (letter)
 *
 * If it is an address then we convert the contact CSV string to an array. If it is an email we return the email in
 * array for the UI to have consistent formatting.
 *
 * @param {object} recipient
 *
 * @returns {object} - a contact
 */
function go(recipient) {
  if (recipient.email) {
    return [recipient.email]
  }

  const notifyAddress = NotifyAddressPresenter.go(recipient.contact)

  return Object.values(notifyAddress)
}

module.exports = { go }
