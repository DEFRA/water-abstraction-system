'use strict'

/**
 * Generate a preview of a notification using GOV.UK Notify
 * @module GeneratePreviewRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * Generate a preview of a notification using GOV.UK Notify
 *
 * When generating a preview the body must include `personalisation` containing matching placeholders for the template
 * being previewed.
 *
 * ```javascript
 * const personalisation: {
 *   periodEndDate: '28th January 2025',
 *   periodStartDate: '1st January 2025',
 *   returnDueDate: '28th April 2025'
 * }
 * ```
 *
 * > See
 * > {@link https://docs.notifications.service.gov.uk/rest-api.html#generate-a-preview-template | Generate a preview template}
 * > for more details.
 *
 * > Note - When providing a Date for a placeholder be sure to format it prior to sending. Otherwise, the output will be
 * > formatted, for example, as 'Wed Feb 19 2025 09:14:15 GMT+0000 (Greenwich Mean Time)'
 *
 * @param {string} templateId - The ID of the template in Notify to generate a preview for
 * @param {object} personalisation - The placeholders needed for the template
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(templateId, personalisation) {
  const path = `v2/template/${templateId}/preview`

  const body = { personalisation }

  return NotifyRequest.post(path, body)
}

module.exports = {
  send
}
