'use strict'

const DataController = require('../controllers/data.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/data/deduplicate',
    options: {
      handler: DataController.deduplicate,
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
    options: {
      handler: DataController.submitDeduplicate,
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
    options: {
      handler: DataController.load,
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
    options: {
      handler: DataController.seed,
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
    options: {
      handler: DataController.tearDown,
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false
    }
  }
]

module.exports = routes
