'use strict'

/**
 * Fetches pending notifications awaiting a status update from Notify
 * @module FetchNotificationsService
 */

const NotificationModel = require('../../../models/notification.model.js')
const { today } = require('../../../lib/general.lib.js')

const notifyConfig = require('../../../../config/notify.config.js')

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
async function go() {
  const todaysDate = today()
  const retentionStartDate = today()

  retentionStartDate.setDate(todaysDate.getDate() - notifyConfig.daysOfRetention)

  const query = NotificationModel.query()
    .select([
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

module.exports = {
  go
}
