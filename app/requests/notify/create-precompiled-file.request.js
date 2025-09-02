'use strict'

/**
 * Create and send a precompiled file using GOV.UK Notify
 * @module CreatePrecompiledFileRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * Create and send a precompiled file using GOV.UK Notify
 *
 * When sending a file, the body must include the content of the file as a base64 encoded string and the reference.
 *
 * Notify requires the Letter content to be a PDF and will error when it is not a PDF: Letter content is not a valid PDF
 *
 * The postage is defaulted to second class.
 *
 * > See {@link https://docs.notifications.service.gov.uk/rest-api.html#send-a-file-by-email | Send a precompiled letter} for more details.
 *
 * @param {string} content - a base 64 encoded string
 * @param {string} reference - the unique string for the notification group
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(content, reference) {
  const path = 'v2/notifications/letter'

  const body = {
    reference,
    content
  }

  return NotifyRequest.post(path, body)
}

module.exports = {
  send
}
