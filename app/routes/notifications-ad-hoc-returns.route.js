'use strict'

const NotificationsAdHocReturnsController = require('../controllers/notifications-ad-hoc-returns.controller.js')

const basePath = '/notifications/ad-hoc-returns/'

const routes = [
  {
    method: 'GET',
    path: basePath + '{sessionId}/licence',
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
    method: 'GET',
    path: basePath + 'setup',
    options: {
      handler: NotificationsAdHocReturnsController.setup,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: basePath + '{sessionId}/licence',
    options: {
      handler: NotificationsAdHocReturnsController.submitLicence,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: basePath + '{sessionId}/check-returns',
    options: {
      handler: NotificationsAdHocReturnsController.checkReturns,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  }
]

module.exports = routes
