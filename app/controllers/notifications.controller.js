'use strict'

/**
 * Controller for /notifications endpoints
 * @module NotificationsController
 */

const NotificationsIndexService = require('../services/notifications/index.service.js')
const SubmitNotificationsIndexService = require('../services/notifications/submit-index.service.js')

const basePath = 'notifications'

async function index(request, h) {
  const pageData = await NotificationsIndexService.go(request.yar)

  return h.view(`${basePath}/index.njk`, pageData)
}

async function submitIndex(request, h) {
  await SubmitNotificationsIndexService.go(request.payload, request.yar)

  return h.redirect('/system/notifications')
}

module.exports = {
  index,
  submitIndex
}
