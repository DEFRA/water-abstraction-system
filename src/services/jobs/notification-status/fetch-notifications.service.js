/**
 * Fetches pending notifications awaiting a status update from Notify
 * @module FetchNotificationsService
 */

import NotificationModel from 'water-abstraction-engine/models/notification.model.js'
import NotifyConfig from 'water-abstraction-engine/config/notify.config.js'
import { today } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Fetches pending notifications awaiting a status update from Notify
 *
 * It is only notifications with a status of 'pending' we care about, because any others will either have failed when
 * sending to Notify, or we've already gotten a response from confirming whether the notification was sent or not.
 *
 * Notify also has a configurable data retention period for messages. By default this is 7 days so we only fetch
 * pending notifications created in the last 7 days.
 *
 * @returns {Promise<object[]>} the 'pending' notifications that need their status checking with Notify
 */
export default async function fetchNotificationsService() {
  const todaysDate = today()
  const retentionStartDate = today()

  retentionStartDate.setDate(todaysDate.getDate() - NotifyConfig.daysOfRetention)

  const query = NotificationModel.query()
    .select([
      'contactType',
      'createdAt',
      'dueDate',
      'eventId',
      'id',
      'licenceMonitoringStationId',
      'messageRef',
      'messageType',
      'notifyId',
      'notifyStatus',
      'notifyError',
      'personalisation',
      'returnLogIds',
      'status'
    ])
    .where('status', 'pending')
    .andWhere('createdAt', '>=', retentionStartDate)

  return query
}
