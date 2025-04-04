'use strict'

/**
 * Send an email using GOV.UK Notify
 * @module NotifyEmailRequest
 */

const NotifyClientRequest = require('./notify-client.request.js')

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
  const notifyClient = NotifyClientRequest.go()

  return _sendEmail(notifyClient, templateId, emailAddress, options)
}

async function _sendEmail(notifyClient, templateId, emailAddress, options) {
  try {
    const response = await notifyClient.sendEmail(templateId, emailAddress, options)

    return {
      id: response.data.id,
      plaintext: response.data.content.body,
      status: response.status,
      statusText: response.statusText.toLowerCase()
    }
  } catch (error) {
    const errorDetails = {
      status: error.status,
      message: error.message,
      errors: error.response.data.errors
    }

    global.GlobalNotifier.omfg('Notify send email failed', errorDetails)

    return errorDetails
  }
}

module.exports = {
  send
}
