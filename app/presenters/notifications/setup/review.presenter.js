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
    recipientsAmount: recipients.length,
    recipients: _recipients(recipients)
  }
}

function _recipients(recipients) {
  return recipients.map((recipient) => {
    return {
      contact: _contact(recipient.contact),
      licences: _licences(recipient.all_licences),
      method: recipient.message_type
    }
  })
}

function _licences(licences) {
  return licences.split(',')
}

/**
 * Convert the contact json object to an array
 *
 * Remove any null fields
 *
 * @param {object} contact
 * @returns {Array[object]}
 */
function _contact(contact) {
  return Object.values(contact).filter((n) => n)
}

module.exports = {
  go
}
