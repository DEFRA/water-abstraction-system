'use strict'

const NotificationsSetupController = require('../controllers/notifications-setup.controller.js')

const basePath = '/notifications/setup/'

const routes = [
  {
    method: 'GET',
    path: basePath + 'returns-period',
    options: {
      handler: NotificationsSetupController.viewReturnsPeriod,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
