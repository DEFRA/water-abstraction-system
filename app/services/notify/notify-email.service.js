'use strict'

/**
 * Sends an email using GOV.UK Notify
 * @module NotifyEmailService
 */

const NotifyClient = require('notifications-node-client').NotifyClient

const config = require('../../../config/notify.config.js')

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
 * @param {string} templateId
 * @param {string} emailAddress
 * @param {object} options
 *
 * @returns {Promise<object>}
 */
async function go(templateId, emailAddress, options) {
  const apiKey = config.apiKey

  const notifyClient = new NotifyClient(apiKey)

  return _sendEmail(notifyClient, templateId, emailAddress, options)
}

async function _sendEmail(notifyClient, templateId, emailAddress, options) {
  try {
    const response = await notifyClient.sendEmail(templateId, emailAddress, options)

    return {
      status: response.status
    }
  } catch (error) {
    return {
      status: error.status,
      message: error.message,
      errors: error.response.data.errors
    }
  }
}

module.exports = {
  go
}
