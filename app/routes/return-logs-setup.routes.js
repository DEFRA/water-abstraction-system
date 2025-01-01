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
  }
]

module.exports = routes
