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
    .whereNotIn('notifications.messageRef', ['password_reset_email'])
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
