'use strict'

const UsersSetupController = require('../controllers/users-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/users/internal/setup',
    options: {
      handler: UsersSetupController.setupInternal,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/check',
    options: {
      handler: UsersSetupController.viewCheck,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/check',
    options: {
      handler: UsersSetupController.submitCheck,
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
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/permissions',
    options: {
      handler: UsersSetupController.submitPermissions,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/email',
    options: {
      handler: UsersSetupController.viewEmail,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/email',
    options: {
      handler: UsersSetupController.submitEmail,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  }
]

module.exports = routes
