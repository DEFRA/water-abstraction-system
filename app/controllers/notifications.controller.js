'use strict'

/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

const { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants

const DownloadNotificationService = require('../services/notifications/download-notification.service.js')
const ProcessReturnedLetterService = require('../services/notifications/process-returned-letter.service.js')
const ViewNotificationService = require('../services/notifications/view-notification.service.js')

async function download(request, h) {
  const { id: notificationId } = request.params

  const fileBuffer = await DownloadNotificationService.go(notificationId)

  return h.response(fileBuffer).type('application/pdf').header('Content-Disposition', 'inline; filename="letter.pdf"')
}

async function returnedLetter(request, h) {
  await ProcessReturnedLetterService.go(request.payload)

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function view(request, h) {
  const { id: notificationId } = request.params
  const { id: licenceId } = request.query
  const { return: returnLogId } = request.query

  const pageData = await ViewNotificationService.go(notificationId, licenceId, returnLogId)

  return h.view('notifications/view.njk', pageData)
}

module.exports = {
  download,
  returnedLetter,
  view
}
