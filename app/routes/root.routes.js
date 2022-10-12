'use strict'

const RootController = require('../controllers/root.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: RootController.index,
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/status',
    handler: RootController.index,
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/hello-world',
    handler: RootController.helloWorld,
    options: {
      auth: false
    }
  }
]

module.exports = routes
