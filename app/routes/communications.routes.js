'use strict'

const CommunicationsController = require('../controllers/communications.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/communications/{id}',
    options: {
      handler: CommunicationsController.view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
