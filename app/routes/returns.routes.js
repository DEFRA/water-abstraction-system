'use strict'

const ReturnsController = require('../controllers/returns.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/returns/return-log',
    options: {
      handler: ReturnsController.returnLog,
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
