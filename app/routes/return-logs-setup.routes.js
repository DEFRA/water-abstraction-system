'use strict'

const ReturnLogsSetupController = require('../controllers/return-logs-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-logs/setup',
    options: {
      handler: ReturnLogsSetupController.setup,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/how-to-edit',
    options: {
      handler: ReturnLogsSetupController.edit,
      app: {
        plainOutput: true
      },
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/how-to-edit',
    options: {
      handler: ReturnLogsSetupController.submitEdit,
      app: {
        plainOutput: true
      },
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
