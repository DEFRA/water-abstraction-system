'use strict'

const ReturnLogsEditController = require('../controllers/return-logs-edit.controller.js')

const basePath = '/return-log-edit/'

const routes = [
  {
    method: 'GET',
    path: basePath + 'setup',
    options: {
      handler: ReturnLogsEditController.setup,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: basePath + '{sessionId}/how-to-edit',
    options: {
      handler: ReturnLogsEditController.edit,
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
    path: basePath + '{sessionId}/how-to-edit',
    options: {
      handler: ReturnLogsEditController.submitEdit,
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
