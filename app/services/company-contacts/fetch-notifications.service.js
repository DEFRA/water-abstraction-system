'use strict'

/**
 * Fetches data needed for the view '/system/company-contacts/{id}' page
 * @module FetchNotificationsService
 */

const { ref } = require('objection')

const NotificationModel = require('../../models/notification.model.js')
const databaseConfig = require('../../../config/database.config.js')

/**
 * Fetches data needed for the view '/system/company-contacts/{id}' page
 *
 * @param {string} companyContactId - The company contact id
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the data needed to populate the view company contacts communications
 */
async function go(companyContactId, page) {
  const { results: notifications, total: totalNumber } = await _fetch(companyContactId, page)

  return { notifications, totalNumber }
}

async function _fetch(companyContactId, page) {
  return NotificationModel.query()
    .select(['notifications.createdAt', 'notifications.id', 'notifications.messageType', 'notifications.status'])
    .innerJoin('public.contacts', 'public.contacts.email', 'notifications.recipient')
    .innerJoin('public.companyContacts', 'public.companyContacts.contactId', 'public.contacts.id')
    .where('public.companyContacts.id', companyContactId)
    .whereNotIn('notifications.messageRef', [
      'email_change_email_in_use_email',
      'email_change_verification_code_email',
      'existing_user_verification_email',
      'expiry_notification_email',
      'fake!',
      'new_internal_user_email',
      'new_user_verification_email',
      'password_locked_email',
      'password_reset_email',
      'security_code_letter',
      'share_existing_user',
      'share_new_user'
    ])
    .orderBy('notifications.createdAt', 'DESC')
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select([
        'id',
        'issuer',
        'subtype',
        ref('metadata:options.sendingAlertType').castText().as('sendingAlertType')
      ])
    })
    .page(page - 1, databaseConfig.defaultPageSize)
}

module.exports = {
  go
}
