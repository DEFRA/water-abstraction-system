'use strict'

/**
 * Deletes the company contact
 * @module DeleteCompanyContactService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const FetchNotificationService = require('../company-contacts/setup/fetch-notification.service.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')

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
  const notification = await FetchNotificationService.go(email)

  if (notification) {
    await CompanyContactModel.query().update({ deletedAt: timestampForPostgres() }).where('id', id)
  } else {
    await CompanyContactModel.query().deleteById(id)
  }
}

module.exports = {
  go
}
