'use strict'

const ReturnLogsController = require('../controllers/return-logs.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-logs/edit',
    options: {
      handler: ReturnLogsController.edit,
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
    method: 'GET',
    path: '/return-logs/confirmation',
    options: {
      handler: ReturnLogsController.confirmation,
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
