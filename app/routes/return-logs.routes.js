'use strict'

const ReturnLogsController = require('../controllers/return-logs.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-logs/{returnId}',
    options: {
      handler: ReturnLogsController.view
    }
  },
  {
    method: 'POST',
    path: '/return-logs/{returnId}',
    options: {
      handler: ReturnLogsController.submitView
    }
  },
  {
    method: 'GET',
    path: '/return-logs/{returnId}/download',
    options: {
      handler: ReturnLogsController.download
    }
  }
]

module.exports = routes
