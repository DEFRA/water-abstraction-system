/**
 * Update the status of a notification
 * @module UpdateStatusDal
 */

import NotificationModel from 'water-abstraction-engine/models/notification.model.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Update the status of a notification
 *
 * After checking the status of a notification with {@link https://www.notifications.service.gov.uk/|GOV.UK Notify},
 * if the _request_ succeeded, which doesn't mean the notification did, we update the notification.
 *
 * For example, we've successfully confirmed that the **Notify** status for a letter is 'received', which means our
 * status will be 'sent'.
 *
 * Or, the request succeeded, but **Notify** have confirmed that the provider failed to print the letter, so its status
 * will be 'permanent-failure', and ours will be 'error'.
 *
 * @param {string} notificationId - the UUID of the notification to update
 * @param {string} notifyStatus - the status returned by Notify
 * @param {string} status - the status to set for the notification in our system
 * @param {object} trx - Database transaction object to ensure all DB changes are applied, or none at all
 */
export default async function updateStatusDal(notificationId, notifyStatus, status, trx) {
  await NotificationModel.query(trx)
    .patch({ notifyStatus, status, updatedAt: timestampForPostgres() })
    .findById(notificationId)
}
