/**
 * Orchestrates sending an Email notification to Notify
 * @module SendEmailNotificationService
 */

import { send } from '../../../../requests/notify/create-email.request.js'
import NotifyUpdatePresenter from '../../../../presenters/notifications/notify-update.presenter.js'

/**
 * Orchestrates sending an email notification to Notify
 *
 * @param {object} notification - the notification to send to Notify
 * @param {string} referenceCode - the generated notice reference code
 *
 * @returns {Promise<object>} a notification with the Notify response
 */
export default async function go(notification, referenceCode) {
  const notifyResult = await send(notification.templateId, notification.recipient, {
    personalisation: notification.personalisation,
    reference: referenceCode
  })

  return {
    ...NotifyUpdatePresenter(notifyResult),
    id: notification.id
  }
}
