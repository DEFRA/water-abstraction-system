'use strict'

const NotificationsController = require('../controllers/notifications.controller.js')

const basePath = '/notifications'

const routes = [
  {
    method: 'GET',
    path: basePath,
    options: {
      handler: NotificationsController.view,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: basePath,
    options: {
      handler: NotificationsController.submitView,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  }
]

module.exports = routes
