'use strict'

const DataController = require('../controllers/data.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/data/deduplicate',
    handler: DataController.deduplicate,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/data/deduplicate',
    handler: DataController.submitDeduplicate,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/data/load',
    handler: DataController.load,
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/data/seed',
    handler: DataController.seed,
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/data/tear-down',
    handler: DataController.tearDown,
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false
    }
  }
]

module.exports = routes
