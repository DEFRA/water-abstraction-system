'use strict'

/**
 * Formats the result of the send email or letter request to GOV.UK Notify into data for 'water.scheduled_notifications'
 * @module NotifyUpdatePresenter
 */

/**
 * Formats the result of the send email or letter request to GOV.UK Notify into data for 'water.scheduled_notifications'
 *
 * When the request is made to notify we need to capture the response.
 *
 * When the request is successful we need to store the notify ID to make future check on its status.
 *
 * When a request fails we will not receive a notify ID and will need to store the error in the same pattern as the
 * legacy code.
 *
 * @param {object } notifyResult - the result of the send email or letter request to GOV.UK Notify
 *
 * @returns {object} the data from the result needed to save to 'water.scheduled_notifications'
 */
function go(notifyResult) {
  const { response, succeeded } = notifyResult

  if (succeeded) {
    return {
      notifyId: response.body.id,
      notifyStatus: 'created',
      plaintext: response.body.content?.body,
      status: 'pending'
    }
  }

  return {
    notifyError: JSON.stringify({
      status: response.statusCode,
      message: `Request failed with status code ${response.statusCode}`,
      errors: response.body.errors
    }),
    status: 'error'
  }
}

module.exports = {
  go
}
