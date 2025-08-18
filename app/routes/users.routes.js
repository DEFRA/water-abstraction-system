'use strict'

const UsersController = require('../controllers/users.controller.js')

const routes = [
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
