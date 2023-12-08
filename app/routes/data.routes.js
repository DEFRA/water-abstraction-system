'use strict'

const DataController = require('../controllers/data.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/data/export',
    handler: DataController.exportDb,
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      description: 'Used to export the database and upload the file to our AWS S3 bucket'
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
