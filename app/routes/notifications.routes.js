'use strict'

const NotificationsController = require('../controllers/notifications.controller.js')

const basePath = '/notifications'

const routes = [
  {
    method: 'GET',
    path: basePath + '/{id}',
    options: {
      handler: NotificationsController.view
    }
  }
]

module.exports = routes
