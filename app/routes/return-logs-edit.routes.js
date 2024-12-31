'use strict'

const ReturnLogsEditController = require('../controllers/return-logs-edit.controller.js')

const basePath = '/return-log-edit/'

const routes = [
  {
    method: 'GET',
    path: basePath,
    options: {
      handler: ReturnLogsEditController.setup,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
