'use strict'

/**
 * Send a letter using GOV.UK Notify
 * @module NotifyLetterRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * Send a letter using GOV.UK Notify
 *
 * When sending an email the body must include `template_id` and `personalisation`. There are other optional properties
 * you can include, for example, `reference`, which we would normally set.
 *
 * The `personalisation` property must contain the address. The address must have at least 3 lines and the last line
 * needs to be a real UK postcode or the name of a country outside the UK.
 *
 * ```javascript
 * const options = {
 *   personalisation: {
 *     address_line_1: 'Amala Bird',
 *     address_line_2: '123 High Street',
 *     address_line_3: 'Richmond upon Thames','
 *     address_line_4: 'Middlesex',
 *     address_line_5: 'SW14 6BF"
 *     name: 'Amala Bird',
 *     periodEndDate: '28th January 2025',
 *     periodStartDate: '1st January 2025',
 *     returnDueDate: '28th April 2025'
 *   },
 *   reference: 'RINV-G2UYT8'
 * }
 * ```
 *
 * > See {@link https://docs.notifications.service.gov.uk/rest-api.html#send-a-letter | Send a letter} for more details.
 *
 * > Note - When providing a Date for a placeholder be sure to format it prior to sending. Otherwise, the output will be
 * > formatted, for example, as 'Wed Feb 19 2025 09:14:15 GMT+0000 (Greenwich Mean Time)'
 *
 * @param {string} templateId - The ID of the template in Notify to use
 * @param {object} options - Any additional options to include in the request, for example, `reference:`
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(templateId, options) {
  const path = 'v2/notifications/letter'

  const body = {
    template_id: templateId,
    ...options
  }

  return NotifyRequest.post(path, body)
}

module.exports = {
  send
}
