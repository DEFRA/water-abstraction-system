'use strict'

const ReturnLogsMissingController = require('../controllers/return-logs-missing.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/return-logs/missing/process',
    options: {
      handler: ReturnLogsMissingController.process,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  }
]

module.exports = routes
