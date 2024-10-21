'use strict'

const ReturnRequirementsController = require('../controllers/return-requirements.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-requirements/{id}',
    options: {
      handler: ReturnRequirementsController.view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
