'use strict'

const AuthenticationController = require('../controllers/authentication.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/signed-out',
    options: {
      auth: false,
      handler: AuthenticationController.viewSignedOut
    }
  },
  {
    method: 'GET',
    path: '/signin',
    options: {
      auth: false,
      handler: AuthenticationController.viewSignin
    }
  },
  {
    method: 'POST',
    path: '/signin',
    options: {
      auth: false,
      handler: AuthenticationController.submitSignin
    }
  },
  {
    method: 'POST',
    path: '/signout',
    options: {
      auth: false,
      handler: AuthenticationController.submitSignout
    }
  }
]

module.exports = routes
