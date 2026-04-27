'use strict'

const UsersSetupController = require('../controllers/users-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/users/internal/setup',
    options: {
      handler: UsersSetupController.setup,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  }
]

module.exports = routes
