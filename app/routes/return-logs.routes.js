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
    method: 'POST',
    path: '/return-logs/edit',
    options: {
      handler: ReturnLogsController.submitEdit,
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
