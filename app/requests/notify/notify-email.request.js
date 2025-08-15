'use strict'

/**
 * Send an email using GOV.UK Notify
 * @module NotifyEmailRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * Send an email using GOV.UK Notify
 *
 * https://docs.notifications.service.gov.uk/node.html#send-an-email
 *
 * Notify has the option to provide an 'options' object. This is the object which populates templates placeholders
 * (known as 'personalisation') and other options such as a 'reference' for identifying single unique message
 * or a batch of messages.
 *
 * ```javascript
 *   const options = {
 *       personalisation: {
 *         name: 'test', // matches the template placeholder {{ name }}
 *       },
 *       reference: 'ABC-123' // A unique identifier which identifies a single unique message or a batch of messages
 *     }
 * ```
 *
 * > If there are any dates types for any placeholder be sure to format the date prior to sending to notify. Otherwise,
 * the output will be formatted like: 'Wed Feb 19 2025 09:14:15 GMT+0000 (Greenwich Mean Time)'
 *
 * @param {string} templateId
 * @param {string} emailAddress
 * @param {object} options
 *
 * @returns {Promise<object>}
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
