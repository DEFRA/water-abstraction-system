'use strict'

const NotificationsAdHocReturnsController = require('../controllers/notifications-ad-hoc-returns.controller.js')

const basePath = '/notifications/ad-hoc-returns/'

const routes = [
  {
    method: 'GET',
    path: basePath + 'licence',
    options: {
      handler: NotificationsAdHocReturnsController.licence,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: basePath + 'licence',
    options: {
      handler: NotificationsAdHocReturnsController.submitLicence,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  }
]

module.exports = routes
