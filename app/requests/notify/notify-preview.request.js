'use strict'

/**
 * Generate a preview template using GOV.UK Notify
 * @module NotifyPreviewRequest
 */

const NotifyClientRequest = require('./notify-client.request.js')

const NotifyRequest = require('../notify.request.js')

/**
 * Generate a preview template using GOV.UK Notify
 *
 * https://docs.notifications.service.gov.uk/node.html#generate-a-preview-template
 *
 * @param {string} templateId
 * @param {object} placeholderFields - Optional personalisation data to be used in the template
 *
 * @returns {Promise<object>}
 */
async function send(templateId, placeholderFields = {}) {
  const path = `v2/template/${templateId}/preview`

  const body = { personalisation: { ...placeholderFields } }

  return NotifyRequest.post(path, body)

  // const notifyClient = NotifyClientRequest.go()

  // return _generatePreview(notifyClient, templateId, personalisation)
}

async function _generatePreview(notifyClient, templateId, personalisation) {
  try {
    const response = await notifyClient.previewTemplateById(templateId, personalisation)

    return {
      id: response.data.id,
      plaintext: response.data.body,
      status: response.status,
      statusText: response.statusText.toLowerCase()
    }
  } catch (error) {
    const errorDetails = {
      status: error.status,
      message: error.message,
      errors: error.response.data.errors
    }

    global.GlobalNotifier.omfg('Notify generate preview failed', errorDetails)

    return errorDetails
  }
}

module.exports = {
  send
}
