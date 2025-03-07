'use strict'

const ReturnLogsController = require('../controllers/return-logs.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-logs',
    options: {
      handler: ReturnLogsController.view
    }
  },
  {
    method: 'POST',
    path: '/return-logs',
    options: {
      handler: ReturnLogsController.submitView
    }
  },
  {
    method: 'GET',
    path: '/return-logs/download',
    options: {
      handler: ReturnLogsController.download
    }
  }
]

module.exports = routes
