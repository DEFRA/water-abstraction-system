'use strict'

/**
 * Send a letter using GOV.UK Notify
 * @module NotifyLetterService
 */

const NotifyClient = require('notifications-node-client').NotifyClient

const config = require('../../../config/notify.config.js')

/**
 * Send a letter using GOV.UK Notify
 *
 * https://docs.notifications.service.gov.uk/node.html#send-a-letter
 *
 * Notify has the option to provide an 'options' object. This is the object which populates templates placeholders
 * (known as 'personalisation') and other options such as a 'reference' for identifying single unique message
 * or a batch of messages.
 *
 * ```javascript
 *   const options = {
 *       personalisation: {
 *        //The address must have at least 3 lines.
 *        "address_line_1": "Amala Bird", // required string
 *        "address_line_2": "123 High Street", // required string
 *        "address_line_3": "Richmond upon Thames", // required string
 *        "address_line_4": "Middlesex",
 *        "address_line_5": "SW14 6BF",  // last line of address you include must be a postcode or a country name  outside the UK
 *        name: 'test', // matches the template placeholder {{ name }}
 *       },
 *       reference: 'ABC-123' // A unique identifier which identifies a single unique message or a batch of messages
 *     }
 * ```
 * > If there are any dates types for any placeholder be sure to format the date prior to sending to notify. Otherwise,
 * the output will be formatted like: 'Wed Feb 19 2025 09:14:15 GMT+0000 (Greenwich Mean Time)'
 *
 * @param {string} templateId
 * @param {object} options
 *
 * @returns {Promise<object>}
 */
async function go(templateId, options) {
  const notifyClient = new NotifyClient(config.apiKey)

  return _sendLetter(notifyClient, templateId, options)
}

async function _sendLetter(notifyClient, templateId, options) {
  try {
    const response = await notifyClient.sendLetter(templateId, options)

    return {
      id: response.data.id,
      plaintext: response.data.content.body,
      status: response.status,
      statusText: response.statusText.toLowerCase()
    }
  } catch (error) {
    const formattedError = {
      status: error.status,
      message: error.message,
      errors: error.response.data.errors
    }

    global.GlobalNotifier.omfg('Notify send letter failed', null, formattedError)

    return formattedError
  }
}

module.exports = {
  go
}
