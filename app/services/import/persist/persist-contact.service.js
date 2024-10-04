'use strict'

/**
 * Creates or updates a contact
 * @module PersistContactService
 */

const ContactModel = require('../../../models/contact.model.js')

/**
 * Creates or updates a contact
 *
 * @param trx - the current database transaction
 * @param updatedAt
 * @param contact
 */
async function go (trx, updatedAt, contact) {
  await _persistContact(trx, updatedAt, contact)
}

async function _persistContact (trx, updatedAt, contact) {
  return ContactModel.query(trx)
    .insert({ ...contact, updatedAt })
    .onConflict('externalId')
    .merge([
      'salutation',
      'initials',
      'firstName',
      'lastName',
      'updatedAt'
    ])
}

module.exports = {
  go
}
