'use strict'

const RootController = require('../controllers/root.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: RootController.index,
    options: {
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/robots.txt',
    handler: {
      file: 'app/public/static/robots.txt'
    },
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/status',
    handler: RootController.index,
    options: {
      app: {
        plainOutput: true
      },
      auth: false
    }
  }
]

module.exports = routes
