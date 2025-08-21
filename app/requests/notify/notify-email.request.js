'use strict'

/**
 * Send an email using GOV.UK Notify
 * @module NotifyEmailRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * Send an email using GOV.UK Notify
 *
 * When sending an email the body must include `template_id` and `email_address`. There are other optional properties
 * you can include, `reference` and `personalisation` being the ones we would normally set.
 *
 * ```javascript
 * const options = {
 *   personalisation: {
 *     name: 'test', // matches the template placeholder {{ name }}
 *   },
 *   reference: 'ABC-123' // A unique identifier which identifies a single unique message or a batch of messages
 * }
 * ```
 *
 * > See {@link https://docs.notifications.service.gov.uk/rest-api.html#send-an-email | Send an email} for more details.
 *
 * > Note - When providing a Date for a placeholder be sure to format it prior to sending. Otherwise, the output will be
 * > formatted, for example, as 'Wed Feb 19 2025 09:14:15 GMT+0000 (Greenwich Mean Time)'
 *
 * @param {string} templateId - The ID of the template in Notify to use
 * @param {string} emailAddress - The email address of the recipient
 * @param {object} options - Any additional options to include in the request, for example, `reference:` and
 * `personalisation:`
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(templateId, emailAddress, options) {
  const path = 'v2/notifications/email'

  const body = {
    email_address: emailAddress,
    template_id: templateId,
    ...options
  }

  return NotifyRequest.post(path, body)
}

module.exports = {
  send
}
