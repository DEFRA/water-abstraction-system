/**
 * Formats a recipient into a contact
 * @module ContactPresenter
 */

import NotifyAddressPresenter from './notify-address.presenter.js'

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
export default function go(recipient) {
  if (recipient.message_type === 'Email') {
    return [recipient.email]
  }

  const notifyAddress = NotifyAddressPresenter(recipient.contact)

  return Object.values(notifyAddress)
}
