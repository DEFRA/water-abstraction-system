'use strict'

/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

const DownloadNotificationService = require('../services/notifications/download-notification.service.js')
const ProcessReturnedLetterService = require('../services/notifications/process-returned-letter.service.js')
const ViewNotificationService = require('../services/notifications/view-notification.service.js')

const NO_CONTENT_STATUS_CODE = 204

async function download(request, h) {
  const { id: notificationId } = request.params

  const fileBuffer = await DownloadNotificationService.go(notificationId)

  return h.response(fileBuffer).type('application/pdf').header('Content-Disposition', 'inline; filename="letter.pdf"')
}

async function returnedLetter(request, h) {
  await ProcessReturnedLetterService.go(request.payload)

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function view(request, h) {
  const { id: notificationId } = request.params
  const { id: licenceId } = request.query

  const pageData = await ViewNotificationService.go(notificationId, licenceId)

  return h.view('notifications/view.njk', pageData)
}

module.exports = {
  download,
  returnedLetter,
  view
}
