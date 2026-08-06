/**
 * Fetches the matching notification and licence data needed for the view
 * @module FetchNotificationService
 */

import LicenceModel from 'water-abstraction-engine/models/licence.model.js'
import NotificationModel from 'water-abstraction-engine/models/notification.model.js'
import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'
import { db } from 'water-abstraction-engine/db/db.js'

/**
 * Fetches the matching notification and licence data needed for the view
 *
 * @param {string} notificationId - The UUID for the notification
 * @param {string} [licenceId=null] - If coming from the licence communications page, the UUID of the licence that
 * relates to the notification
 *
 * @returns {Promise<module:NotificationModel>} the matching `NotificationsModel` instance and
 * licence data
 */
export default async function fetchNotificationService(notificationId, licenceId = null) {
  const licence = await _fetchLicence(licenceId)
  const notification = await _fetchNotification(notificationId)

  return { licence, notification }
}

async function _fetchLicence(licenceId) {
  if (!licenceId) {
    return null
  }

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
        Objection.ref('metadata:options.sendingAlertType').castText().as('sendingAlertType')
      ])
    })
}
