'use strict'

const RootController = require('../controllers/root.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/',
    options: {
      handler: RootController.index,
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/robots.txt',
    options: {
      handler: {
        file: 'app/public/static/robots.txt'
      },
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/status',
    options: {
      handler: RootController.index,
      app: {
        plainOutput: true
      },
      auth: false
    }
  }
]

module.exports = routes
