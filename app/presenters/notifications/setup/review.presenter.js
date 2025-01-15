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
  const uniqueRecipients = _normalise(recipients)
  return {
    pageTitle: 'Review the mailing list',
    recipientsAmount: uniqueRecipients.length,
    recipients: _recipients(uniqueRecipients, page)
  }
}

//  do you need to map fist for licence numbers ?
function _normalise(recipients) {
  return Object.values(
    recipients.reduce((acc, obj) => {
      if (!acc[obj.contact_hash_id]) {
        acc[obj.contact_hash_id] = obj
      } else {
        // If a contact has already exists
        const rolePreference = ['Primary user', 'Licence holder', 'Returns to']
        const existingRoleIndex = rolePreference.indexOf(acc[obj.contact_hash_id].contact.role)
        const newRoleIndex = rolePreference.indexOf(obj.contact.role)

        if (newRoleIndex !== -1 && (existingRoleIndex === -1 || newRoleIndex < existingRoleIndex)) {
          acc[obj.contact_hash_id] = obj
        }
      }
      return acc
    }, {})
  )
}

// We need to map to dedup and the paginatae other wiose the total is off
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
