'use strict'

/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

const SubmitReturnedLetterService = require('../services/notifications/submit-returned-letter.service.js')
const ViewNotificationService = require('../services/notifications/view-notification.service.js')

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
  const { notification_id: notificationId, reference } = request.payload

  global.GlobalNotifier.omg('Return letter callback triggered', { notificationId, reference })

  await SubmitReturnedLetterService.go(notificationId)

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function view(request, h) {
  const { id: notificationId } = request.params
  const { id: licenceId } = request.query

  const pageData = await ViewNotificationService.go(notificationId, licenceId)

  return h.view('notifications/view.njk', pageData)
}

module.exports = {
  returnedLetter,
  view
}
