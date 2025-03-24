'use strict'

/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

const ViewNotificationsService = require('../services/notifications/view-notifications.service.js')

async function view(request, h) {
  const { id: notificationId } = request.params
  const { id: licenceId } = request.query

  const pageData = await ViewNotificationsService.go(notificationId, licenceId)

  return h.view('notifications/view.njk', pageData)
}

module.exports = {
  view
}
