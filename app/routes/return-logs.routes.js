'use strict'

const ReturnLogsController = require('../controllers/return-logs.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-logs',
    options: {
      handler: ReturnLogsController.view
    }
  }
]

module.exports = routes
