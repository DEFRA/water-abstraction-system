'use strict'

/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

const ViewNotificationsService = require('../services/notifications/view.service.js')
const SubmitViewNotificationsService = require('../services/notifications/submit-view.service.js')

const basePath = 'notifications'

async function view(request, h) {
  const pageData = await ViewNotificationsService.go(request.yar)

  return h.view(`${basePath}/view.njk`, pageData)
}

async function submitView(request, h) {
  await SubmitViewNotificationsService.go(request.payload, request.yar)

  return h.redirect('/system/notifications')
}

module.exports = {
  view,
  submitView
}
