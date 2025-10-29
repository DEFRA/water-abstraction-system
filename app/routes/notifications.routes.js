'use strict'

const NotificationsController = require('../controllers/notifications.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/notifications/{id}/download',
    options: {
      handler: NotificationsController.download
    }
  },
  {
    method: 'GET',
    path: '/notifications/{id}',
    options: {
      handler: NotificationsController.view
    }
  },
  {
    method: 'POST',
    path: '/notifications/callbacks/letters',
    options: {
      app: {
        plainOutput: true
      },
      auth: { strategy: 'callback' },
      handler: NotificationsController.returnedLetter,
      plugins: {
        crumb: false
      }
    }
  }
]

module.exports = routes
