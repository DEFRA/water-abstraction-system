'use strict'

const NotificationsController = require('../controllers/notifications.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/notifications/{id}',
    options: {
      handler: NotificationsController.view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
