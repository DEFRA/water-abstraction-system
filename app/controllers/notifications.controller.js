'use strict'

/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

const ViewNotificationService = require('../services/notifications/view-notification.service.js')

async function view(request, h) {
  const { id: notificationId } = request.params
  const { id: licenceId } = request.query

  const pageData = await ViewNotificationService.go(notificationId, licenceId)

  return h.view('notifications/view.njk', pageData)
}

module.exports = {
  view
}
