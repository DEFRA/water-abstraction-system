'use strict'

/**
 * Orchestrates sending a letter notification to Notify
 * @module SendLetterService
 */

const CreateLetterRequest = require('../../../../requests/notify/create-letter.request.js')
const NotifyUpdatePresenter = require('../../../../presenters/notices/setup/notify-update.presenter.js')

/**
 * Orchestrates sending a letter notification to Notify
 *
 * @param {object} notification - the notification to send to Notify
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {Promise<object>} - a notification with the Notify response
 */
async function go(notification, referenceCode) {
  const notifyResult = await CreateLetterRequest.send(notification.templateId, {
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
