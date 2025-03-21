'use strict'

/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

const ViewNotificationsService = require('../services/notifications/view-notifications.service.js')

async function view(request, h) {
  const { id } = request.params

  const pageData = await ViewNotificationsService.go(id)

  return h.view('notifications/view.njk', pageData)
}

module.exports = {
  view
}
