'use strict'

/**
 * Deletes the company contact
 * @module DeleteCompanyContactService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const NotificationModel = require('../../models/notification.model.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')
const { ignoreMessageRef } = require('../../lib/static-lookups.lib.js')

/**
 * Deletes the company contact
 *
 * A company contact can be deleted if it has no associated notifications to the provided email.
 *
 * If there are notifications associated with the provided email, the company contact will not be deleted, it will be
 * 'soft-deleted' (marked as 'deletedAt' in the database).
 *
 * @param {string} id - The id of the company contact
 * @param {string} email - the contact email (may have been used to send notifications)
 */
async function go(id, email) {
  const notification = await _notification(email)

  if (notification) {
    await CompanyContactModel.query().update({ deletedAt: timestampForPostgres() }).where('id', id)
  } else {
    await CompanyContactModel.query().deleteById(id)
  }
}

async function _notification(email) {
  return NotificationModel.query()
    .select(['id'])
    .where('recipient', email)
    .whereNotIn('messageRef', ignoreMessageRef)
    .limit(1)
    .first()
}

module.exports = {
  go
}
