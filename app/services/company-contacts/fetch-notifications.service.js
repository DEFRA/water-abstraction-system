'use strict'

/**
 * Fetches data needed for the view '/system/company-contacts/{id}' page
 * @module FetchNotificationsService
 */

const { ref } = require('objection')

const NotificationModel = require('../../models/notification.model.js')
const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches data needed for the view '/system/company-contacts/{id}' page
 *
 * @param {string} email - The email of the company contact id
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the data needed to populate the view company contacts communications
 */
async function go(email, page) {
  const { results: notifications, total: totalNumber } = await _fetch(email, page)

  return { notifications, totalNumber }
}

async function _fetch(email, page) {
  if (!email) {
    return { results: [], total: 0 }
  }

  return NotificationModel.query()
    .select(['createdAt', 'id', 'messageType', 'status'])
    .whereNotNull('recipient')
    .where('recipient', email)
    .whereNotIn('messageRef', [
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
    .orderBy('createdAt', 'DESC')
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select([
        'id',
        'issuer',
        'subtype',
        ref('metadata:options.sendingAlertType').castText().as('sendingAlertType')
      ])
    })
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
