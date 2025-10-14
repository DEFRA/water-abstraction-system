'use strict'

/**
 * Orchestrates sending a paper return notification to Notify
 * @module SendPaperReturnService
 */

const CreatePrecompiledFileRequest = require('../../../../requests/notify/create-precompiled-file.request.js')
const NotificationErrorPresenter = require('../../../../presenters/notices/setup/notification-error.presenter.js')
const NotifyUpdatePresenter = require('../../../../presenters/notices/setup/notify-update.presenter.js')
const PreparePaperReturnService = require('../prepare-paper-return.service.js')

/**
 * Orchestrates sending a paper return notification to Notify
 *
 * @param {object} notification - the notification to send to Notify
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {Promise<object>} - a notification with the Notify response
 */
async function go(notification, referenceCode) {
  const returnFormRequest = await PreparePaperReturnService.go(notification)

  if (returnFormRequest.succeeded) {
    const pdf = returnFormRequest.response.body

    const notifyResult = await CreatePrecompiledFileRequest.send(pdf, referenceCode)

    return {
      ...NotifyUpdatePresenter.go(notifyResult),
      id: notification.id,
      pdf
    }
  }

  return _returnFromError(notification, returnFormRequest)
}

function _returnFromError(notification, returnFormRequest) {
  const errors = [returnFormRequest.response.message]

  return {
    ...NotificationErrorPresenter.go(returnFormRequest.response.code, `Failed to generate the return form PDF`, errors),
    id: notification.id
  }
}

module.exports = {
  go
}
