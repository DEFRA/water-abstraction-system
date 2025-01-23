'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module ReviewPresenter
 */

const { defaultPageSize } = require('../../../../config/database.config.js')
const { titleCase } = require('../../base.presenter.js')

/**
 * Formats data for the `/notifications/setup/review` page
 *
 * @param recipients
 * @returns {object} - The data formatted for the view template
 */
function go(recipients) {
  return {
    defaultPageSize,
    pageTitle: 'Send returns invitations',
    recipients: _recipients(recipients),
    recipientsAmount: recipients.length
  }
}

/**
 * Contact can be an email or an address (letter)
 *
 * If it is an address then we convert the contact CSV string to an array
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
  }

  return recipient.contact.split(',').map(titleCase)
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

function _recipients(recipients) {
  return recipients.map((recipient) => {
    return {
      contact: _contact(recipient),
      licences: _licences(recipient.all_licences),
      method: recipient.message_type
    }
  })
}

module.exports = {
  go
}
