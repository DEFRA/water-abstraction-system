'use strict'

const ReturnLogsController = require('../controllers/return-logs.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-logs/{returnLogId}',
    options: {
      handler: ReturnLogsController.view
    }
  },
  {
    method: 'POST',
    path: '/return-logs/{returnLogId}',
    options: {
      handler: ReturnLogsController.submitView
    }
  },
  {
    method: 'GET',
    path: '/return-logs/{returnLogId}/download',
    options: {
      handler: ReturnLogsController.download
    }
  }
]

module.exports = routes
