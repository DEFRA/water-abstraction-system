'use strict'

/**
 * Generate a preview of a notification using GOV.UK Notify
 * @module NotifyPreviewRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * Generate a preview of a notification using GOV.UK Notify
 *
 * https://docs.notifications.service.gov.uk/node.html#generate-a-preview-template
 *
 * @param {string} templateId
 * @param {object} placeholderFields - Optional personalisation data to be used in the notification
 *
 * @returns {Promise<object>}
 */
async function send(templateId, placeholderFields = {}) {
  const path = `v2/template/${templateId}/preview`

  const body = { personalisation: { ...placeholderFields } }

  return NotifyRequest.post(path, body)
}

module.exports = {
  send
}
