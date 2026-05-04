'use strict'

const UsersController = require('../controllers/users.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/users',
    options: {
      handler: UsersController.index,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users',
    options: {
      handler: UsersController.submitIndex,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/external/{id}/details',
    options: {
      handler: UsersController.viewExternalDetails
    }
  },
  {
    method: 'POST',
    path: '/users/external/{id}/details',
    options: {
      handler: UsersController.submitExternalDetails
    }
  },
  {
    method: 'GET',
    path: '/users/internal/{id}/communications',
    options: {
      handler: UsersController.viewInternalCommunications,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/{id}/details',
    options: {
      handler: UsersController.viewInternalDetails,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/{id}/details',
    options: {
      handler: UsersController.submitInternalDetails
    }
  },
  {
    method: 'GET',
    path: '/users/{type}/{id}/notifications/{notificationId}',
    options: {
      handler: UsersController.viewNotification,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/me/profile-details',
    options: {
      handler: UsersController.viewProfileDetails,
      auth: {
        access: {
          scope: ['hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/me/profile-details',
    options: {
      handler: UsersController.submitProfileDetails,
      auth: {
        access: {
          scope: ['hof_notifications', 'renewal_notifications']
        }
      }
    }
  }
]

module.exports = routes
