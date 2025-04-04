'use strict'

/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

const NotificationsIndexService = require('../services/notifications/index.service.js')
const SubmitNotificationsIndexService = require('../services/notifications/submit-index.service.js')
const ViewNotificationService = require('../services/notifications/view-notification.service.js')

const basePath = 'notifications'

async function index(request, h) {
  const pageData = await NotificationsIndexService.go(request.yar)

  return h.view(`${basePath}/index.njk`, pageData)
}

async function submitIndex(request, h) {
  await SubmitNotificationsIndexService.go(request.payload, request.yar)

  return h.redirect('/system/notifications')
}

async function view(request, h) {
  const { id: notificationId } = request.params
  const { id: licenceId } = request.query

  const pageData = await ViewNotificationService.go(notificationId, licenceId)

  return h.view('notifications/view.njk', pageData)
}

module.exports = {
  index,
  submitIndex,
  view
}
