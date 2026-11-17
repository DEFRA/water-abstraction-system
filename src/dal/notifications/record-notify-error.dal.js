/**
 * Record the error details as a result of a request to Notify for a notification
 * @module RecordNotifyErrorDal
 */

import NotificationModel from 'water-abstraction-engine/models/notification.model.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Record the error details as a result of a request to Notify for a notification
 *
 * When sending a notification to {@link https://www.notifications.service.gov.uk/|GOV.UK Notify}, or requesting the
 * status of one previously sent, we can encounter an error.
 *
 * This could be because of an issue with the request itself, in which case it is a 'true' error. When this happens the
 * response is passed through {@link module:NotifyErrorPresenter}.
 *
 * ```javascript
 * notifyRequestResult = {
 *   id: 'c275a663-c73d-4c62-9083-2e2640d3fb1d',
 *   notifyError: '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}'
 *   status: 'error'
 * }
 * ```
 *
 * Or the request was successful, but the **Notify** status result we get back confirms an error in sending the
 * notification.
 *
 * ```javascript
 * notifyRequestResult = {
 *   id: 'c275a663-c73d-4c62-9083-2e2640d3fb1d',
 *   notifyId: 'f001b827-faad-4b32-ba00-1c6dc2d7571c',
 *   notifyStatus: 'permanent-failure',
 *   status: 'error'
 * }
 * ```
 *
 * > In both cases it is also expected that the module that sent the request assigns the notification ID to the result.
 *
 * Certain errors can be ignored, for example, the internet was down. We don't want to mark these as errored so we can
 * try them again later. However others indicate a problem with the request itself and need to be recorded.
 *
 * @param {object} notifyRequestResult - the error result from Notify to record against the notification
 * @param {object} trx - Database transaction object to ensure all DB changes are applied, or none at all
 */
export default async function recordNotifyErrorResultDal(notifyRequestResult, trx) {
  const { id, notifyError, notifyStatus, status } = notifyRequestResult

  await NotificationModel.query(trx)
    .patch({ notifyError, notifyStatus, status, updatedAt: timestampForPostgres() })
    .findById(id)
}
