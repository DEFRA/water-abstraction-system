'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module ReviewPresenter
 */

/**
 * Formats data for the `/notifications/setup/review` page
 *
 * @param recipients
 * @returns {object} - The data formatted for the view template
 */
function go(recipients) {
  return {
    pageTitle: 'Send returns invitations',
    recipientsAmount: recipients.length,
    recipients: _recipients(recipients)
  }
}

function _recipients(recipients) {
  return recipients.map((recipient) => {
    return {
      contact: _contact(recipient),
      licences: _licences(recipient.all_licences),
      method: recipient.message_type
    }
  })
}

/**
 * Convert the licence CSV string to an array
 *
 * @param {string} licences
 * @returns {string[]}
 */
function _licences(licences) {
  return licences.split(',')
}

/**
 * Contact can be an email or an address (letter)
 *
 * If it is an address then we convert the contact json object to an array removing any null fields
 *
 * If it is an email we return the email in array for the UI to have consistent formatting
 *
 * @param {object} recipient
 *
 * @returns {string[]}
 */
function _contact(recipient) {
  if (recipient.recipient) {
    return [recipient.recipient]
  } else {
    return Object.values(recipient.contact).filter((n) => n)
  }
}

module.exports = {
  go
}
