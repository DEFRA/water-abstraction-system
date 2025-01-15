'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module ReviewPresenter
 */

const { defaultPageSize } = require('../../../../config/database.config.js')

/**
 * Formats data for the `/notifications/setup/review` page
 *
 * @param recipients
 * @param page
 * @returns {object} - The data formatted for the view template
 */
function go(recipients, page = 1) {
  return {
    pageTitle: 'Review the mailing list',
    recipientsAmount: recipients.length,
    recipients: _recipients(recipients, page)
  }
}

function _recipients(recipients, page) {
  const paginatedRecipients = _pagination(recipients, page)
  return paginatedRecipients.map((recipient) => {
    return {
      contact: _contact(recipient.contact),
      licences: _licences(recipient.all_licences),
      method: recipient.message_type
    }
  })
}

/**
 * Due to the complexity of the query to get the recipients data
 *
 * We need to handle the pagination in the presenter. This is all that is needed and work with the
 * existing pagination patterns
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

function _licences(licences) {
  return licences.split(',')
}

/**
 * Convert the contact json object to an array
 *
 * Remove any null fields
 *
 * @param {object} contact
 * @returns {object[]}
 */
function _contact(contact) {
  return Object.values(contact).filter((n) => n)
}

module.exports = {
  go
}
