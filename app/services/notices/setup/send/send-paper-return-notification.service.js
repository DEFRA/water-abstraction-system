/**
 * Orchestrates sending a paper return notification to Notify
 * @module SendPaperReturnNotificationService
 */

import { send } from '../../../../requests/notify/create-precompiled-file.request.js'
import NotifyErrorPresenter from '../../../../presenters/notifications/notify-error.presenter.js'
import NotifyUpdatePresenter from '../../../../presenters/notifications/notify-update.presenter.js'
import PreparePaperReturnService from '../prepare-paper-return.service.js'

/**
 * Orchestrates sending a paper return notification to Notify
 *
 * @param {object} notification - the notification to send to Notify
 * @param {string} referenceCode - the generated notice reference code
 *
 * @returns {Promise<object>} a notification with the Notify response
 */
export default async function sendPaperReturnNotificationService(notification, referenceCode) {
  const returnFormRequest = await PreparePaperReturnService(notification)

  if (returnFormRequest.succeeded) {
    const pdf = returnFormRequest.response.body

    const notifyResult = await send(pdf, referenceCode)

    return {
      ...NotifyUpdatePresenter(notifyResult),
      id: notification.id,
      pdf
    }
  }

  return _returnFromError(notification, returnFormRequest)
}

function _returnFromError(notification, returnFormRequest) {
  const errors = [returnFormRequest.response.message]

  return {
    ...NotifyErrorPresenter(returnFormRequest.response.code, `Failed to generate the paper return PDF`, errors),
    id: notification.id
  }
}
