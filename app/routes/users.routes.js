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
  },
  {
    method: 'GET',
    path: '/users/{userId}',
    options: {
      handler: UsersController.viewUser
    }
  }
]

module.exports = routes
