/**
 * Orchestrates sending a letter notification to Notify
 * @module SendLetterNotificationService
 */

import { send } from '../../../../requests/notify/create-letter.request.js'
import NotifyUpdatePresenter from '../../../../presenters/notifications/notify-update.presenter.js'

/**
 * Orchestrates sending a letter notification to Notify
 *
 * @param {object} notification - the notification to send to Notify
 * @param {string} referenceCode - the generated notice reference code
 *
 * @returns {Promise<object>} a notification with the Notify response
 */
export default async function go(notification, referenceCode) {
  const notifyResult = await send(notification.templateId, {
    personalisation: notification.personalisation,
    reference: referenceCode
  })

  return {
    ...NotifyUpdatePresenter(notifyResult),
    id: notification.id
  }
}
