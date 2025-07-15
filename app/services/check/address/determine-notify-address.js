'use strict'

const { contactAddress, contactName } = require('../../../presenters/crm.presenter.js')

/**
 * Determines the Notify address to use for a given licence contact
 *
 * @param {object} contact - the contact to determine the Notify address for
 *
 * @returns {object} a Notify compatible address object
 */
function go(contact) {
  const name = contactName(contact)
  const address = contactAddress(contact)

  const fullContact = [name, ...address]

  const addressLines = {}

  for (const [index, value] of fullContact.entries()) {
    addressLines[`address_line_${index + 1}`] = value
  }

  return addressLines
}

module.exports = {
  go
}
