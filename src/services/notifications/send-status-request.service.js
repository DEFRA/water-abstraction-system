/**
 * Send a request to Notify to get the status of a pending notification
 * @module SendStatusRequestService
 */

import ViewMessageDataRequest from 'water-abstraction-engine/requests/notify/view-message-data.request.js'
import { EMAIL_STATUS, LETTER_STATUS, NOTIFICATIONS_STATUS } from 'water-abstraction-engine/lib/notifications.lib.js'

import NotifyErrorPresenter from '../../presenters/notifications/notify-error.presenter.js'

/**
 * Send a request to Notify to get the status of a pending notification
 *
 * @param {object} notification - the notification to we want to get the status for
 *
 * @returns {Promise<object>} - the result from Notify and the ID of the notification
 */
export default async function sendStatusRequestService(notification) {
  const { response, succeeded } = await ViewMessageDataRequest(notification.notifyId)

  if (succeeded) {
    return {
      id: notification.id,
      notifyId: response.body.id,
      notifyStatus: response.body.status,
      status: _status(notification, response.body.status)
    }
  }

  // If the request failed to reach Notify (for example, a timeout) the base request returns the Got error as the
  // response. This is likely temporary, so we return 'pending' to have the status checked again the next time the job
  // runs.
  if (response instanceof Error) {
    return { id: notification.id, status: NOTIFICATIONS_STATUS.pending }
  }

  // If Notify returns a 5xx server error, it's likely a temporary issue. Return 'pending' so the status can be checked
  // again the next time the job runs.
  if (response.statusCode >= 500) {
    return { id: notification.id, status: NOTIFICATIONS_STATUS.pending }
  }

  // If Notify returns a 4xx client error a permanent issue with the request itself and is treated as final.
  //
  // NOTE: The safe navigation operator is intended here. A response from Notify might not have a body.
  const notifyError = NotifyErrorPresenter(
    response.statusCode,
    `Request failed with status code ${response.statusCode}`,
    response.body?.errors
  )

  return {
    ...notifyError,
    id: notification.id
  }
}

function _status(notification, notifyStatus) {
  // If we fail to get the status, we return 'pending' which is the same as doing nothing. This means the notification
  // can be checked again the next time the job runs
  if (!notifyStatus) {
    return NOTIFICATIONS_STATUS.pending
  }

  if (notification.messageType === 'email') {
    return EMAIL_STATUS[notifyStatus] || NOTIFICATIONS_STATUS.pending
  }

  return LETTER_STATUS[notifyStatus] || NOTIFICATIONS_STATUS.pending
}
