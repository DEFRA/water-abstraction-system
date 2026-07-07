/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

import http2 from 'node:http2'
import DownloadNotificationService from '../services/notifications/download-notification.service.js'
import ProcessReturnedLetterService from '../services/notifications/process-returned-letter.service.js'
import ViewNotificationService from '../services/notifications/view-notification.service.js'

const { HTTP_STATUS_NO_CONTENT } = http2.constants

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
  const {
    params: { id: notificationId },
    query: { id: licenceId, return: returnLogId, companyContactId }
  } = request

  const pageData = await ViewNotificationService.go(notificationId, licenceId, returnLogId, companyContactId)

  return h.view('notifications/view.njk', pageData)
}

export {
  download,
  returnedLetter,
  view
}
export default {
  download,
  returnedLetter,
  view
}
