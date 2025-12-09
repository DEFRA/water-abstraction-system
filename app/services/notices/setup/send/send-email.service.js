'use strict'

/**
 * Orchestrates sending an Email notification to Notify
 * @module SendEmailService
 */

const CreateEmailRequest = require('../../../../requests/notify/create-email.request.js')
const NotifyUpdatePresenter = require('../../../../presenters/notices/setup/notify-update.presenter.js')

/**
 * Orchestrates sending an email notification to Notify
 *
 * @param {object} notification - the notification to send to Notify
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {Promise<object>} - a notification with the Notify response
 */
async function go(notification, referenceCode) {
  const notifyResult = await CreateEmailRequest.send(notification.templateId, notification.recipient, {
    personalisation: notification.personalisation,
    reference: referenceCode
  })

  return {
    ...NotifyUpdatePresenter.go(notifyResult),
    id: notification.id
  }
}

module.exports = {
  go
}
