'use strict'

const ReturnVersionsController = require('../controllers/return-versions.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-versions/{id}',
    options: {
      handler: ReturnVersionsController.view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
