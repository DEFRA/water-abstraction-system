'use strict'

const ReturnLogsController = require('../controllers/return-logs.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-logs/{id}/communications',
    options: {
      handler: ReturnLogsController.viewCommunications
    }
  },
  {
    method: 'GET',
    path: '/return-logs/{id}/details',
    options: {
      handler: ReturnLogsController.viewDetails
    }
  },
  {
    method: 'POST',
    path: '/return-logs/{id}/details',
    options: {
      handler: ReturnLogsController.submitDetails
    }
  },
  {
    method: 'GET',
    path: '/return-logs/{id}/download',
    options: {
      handler: ReturnLogsController.download
    }
  }
]

module.exports = routes
