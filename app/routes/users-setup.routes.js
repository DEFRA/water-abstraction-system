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
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/permissions',
    options: {
      handler: UsersSetupController.viewPermissions,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/user-email',
    options: {
      handler: UsersSetupController.viewUserEmail,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/user-email',
    options: {
      handler: UsersSetupController.submitUserEmail,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  }
]

module.exports = routes
