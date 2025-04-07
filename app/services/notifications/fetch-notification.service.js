'use strict'

/**
 * Fetches the matching notification and licence data needed for the view
 * @module FetchNotificationService
 */

const LicenceModel = require('../../models/licence.model.js')
const NotificationsModel = require('../../models/notification.model.js')

/**
 * Fetches the matching notification and licence data needed for the view
 *
 * @param {string} notificationId - The UUID for the notification
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
  return NotificationsModel.query()
    .findById(notificationId)
    .select(['messageType', 'personalisation', 'plaintext', 'createdAt'])
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select(['metadata'])
    })
}

module.exports = {
  go
}
