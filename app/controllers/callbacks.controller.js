'use strict'

/**
 * Controller for /callbacks endpoints
 * @module CallbacksController
 */

const NO_CONTENT_STATUS_CODE = 204

/**
 * If a letter has been returned to notify this end point will be called
 *
 * @param request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function returnedLetter(request, h) {
  console.log('AUTH DEBUG:', request.auth)
  try {
    console.log(request.payload)
    const { notification_id: notificationId, reference } = request.payload
    global.GlobalNotifier.omg('Return letter callback triggered', { notificationId, reference })
  } catch (error) {
    console.log(error)
  }

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

module.exports = {
  returnedLetter
}
