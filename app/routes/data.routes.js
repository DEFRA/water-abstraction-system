'use strict'

const DataController = require('../controllers/data.controller.js')

const routes = [
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
