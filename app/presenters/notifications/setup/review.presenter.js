'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module ReviewPresenter
 */

const { contactName, contactAddress } = require('../../crm.presenter.js')
const { defaultPageSize } = require('../../../../config/database.config.js')

/**
 * Formats data for the `/notifications/setup/review` page
 *
 * @param {object[]} recipients - List of recipient objects, each containing recipient details like email or name.
 * @param {number|string} page - The currently selected page
 * @param {object} pagination -
 *
 * @returns {object} - The data formatted for the view template
 */
function go(recipients, page, pagination) {
  return {
    defaultPageSize,
    pageTitle: _pageTitle(page, pagination),
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
  if (recipient.email) {
    return [recipient.email]
  }

  const name = contactName(recipient.contact)
  const address = contactAddress(recipient.contact)
  return [name, ...address]
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

function _pageTitle(page, pagination) {
  if (pagination.numberOfPages > 1) {
    return `Send returns invitations (page ${page} of ${pagination.numberOfPages})`
  }

  return 'Send returns invitations'
}

/**
 * Due to the complexity of the query to get the recipients data, we handle pagination in the presenter.
 *
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
      licences: _licences(recipient.licence_refs),
      method: recipient.contact_type
    }
  })
}

module.exports = {
  go
}
