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
      auth: false,
      description: 'Returns the same response as /status'
    }
  },
  {
    method: 'GET',
    path: '/robots.txt',
    handler: {
      file: 'app/public/static/robots.txt'
    },
    options: {
      auth: false,
      description: 'Needed to support requests proxied from the legacy UI through to this app'
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
      auth: false,
      description: 'Used by the AWS load balancers to confirm the service is running'
    }
  }
]

module.exports = routes
