'use strict'

/**
 * Orchestrates sending a return form notification to Notify
 * @module SendReturnFormService
 */

const CreatePrecompiledFileRequest = require('../../../../requests/notify/create-precompiled-file.request.js')
const NotifyUpdatePresenter = require('../../../../presenters/notices/setup/notify-update.presenter.js')
const PrepareReturnFormsService = require('../prepare-return-forms.service.js')

/**
 * Orchestrates sending a return form notification to Notify
 *
 * @param {object} notification - the notification to send to Notify
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {Promise<object>} - a notification with the Notify response
 */
async function go(notification, referenceCode) {
  const pdf = await PrepareReturnFormsService.go(notification)

  const notifyResult = await CreatePrecompiledFileRequest.send(pdf, referenceCode)

  return {
    ...NotifyUpdatePresenter.go(notifyResult),
    id: notification.id,
    pdf
  }
}

module.exports = {
  go
}
