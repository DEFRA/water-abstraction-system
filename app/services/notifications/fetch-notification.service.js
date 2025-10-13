'use strict'

/**
 * Fetches the matching notification and licence data needed for the view
 * @module FetchNotificationService
 */

const { ref } = require('objection')

const LicenceModel = require('../../models/licence.model.js')
const NotificationModel = require('../../models/notification.model.js')
const { db } = require('../../../db/db.js')

/**
 * Fetches the matching notification and licence data needed for the view
 *
 * @param {string} notificationId - The UUID for the Notification
 * @param {string} licenceId - The UUID for the related licence
 *
 * @returns {Promise<module:NotificationModel>} the matching `NotificationsModel` instance and
 * licence data
 */
async function go(notificationId, licenceId) {
  const licence = await _fetchLicence(licenceId)
  const notification = await _fetchNotification(notificationId)

  return { licence, notification }
}

async function _fetchLicence(licenceId) {
  return LicenceModel.query().findById(licenceId).select('id', 'licenceRef')
}

async function _fetchNotification(notificationId) {
  return NotificationModel.query()
    .findById(notificationId)
    .select([
      'createdAt',
      'id',
      'messageType',
      'notifyError',
      'notifyStatus',
      'personalisation',
      'plaintext',
      'recipient',
      'returnedAt',
      'status',
      db.raw('(CASE WHEN pdf IS NOT NULL THEN TRUE ELSE FALSE END) AS has_pdf')
    ])
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select([
        'createdAt',
        'id',
        'issuer',
        'referenceCode',
        'subtype',
        ref('metadata:options.sendingAlertType').castText().as('alertType')
      ])
    })
}

module.exports = {
  go
}
