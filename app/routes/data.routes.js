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
      },
      description: 'De-duplicate a licence'
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
      },
      description: 'Submit licence to be de-duped'
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
      auth: false,
      description: 'Used to load test data in the database'
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
      auth: false,
      description: 'Used to seed test data in the database'
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
      auth: false,
      description: 'Used to remove the acceptance test data from the database'
    }
  }
]

module.exports = routes
