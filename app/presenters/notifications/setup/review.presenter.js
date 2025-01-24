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
 * @param {object[]} recipients
 * @param {number|string} page - The currently selected page
 *
 * @returns {object} - The data formatted for the view template
 */
function go(recipients, page = 1) {
  return {
    defaultPageSize,
    pageTitle: 'Send returns invitations',
    recipients: _recipients(recipients, page),
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

/**
 * Due to the complexity of the query to get the recipients data, we handle pagination in the presenter.
 *
 * @param recipients
 * @param page
 * @returns {object} - recipients limited to the pagination amount
 * @private
 */
function _pagination(recipients, page) {
  const pageNumber = Number(page) * defaultPageSize
  return recipients.slice(pageNumber - defaultPageSize, pageNumber)
}

function _recipients(recipients, page) {
  const paginatedRecipients = _pagination(recipients, page)

  return paginatedRecipients.map((recipient) => {
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
