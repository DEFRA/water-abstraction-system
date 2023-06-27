'use strict'

const DataController = require('../controllers/data/data.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/data/db-export',
    handler: DataController.dbExport,
    options: {
      description: 'Used to export the database and upload the file to our AWS S3 bucket',
      app: { excludeFromProd: true }
    }
  },
  {
    method: 'POST',
    path: '/data/tear-down',
    handler: DataController.tearDown,
    options: {
      description: 'Used to remove the acceptance test data from the database',
      app: { excludeFromProd: true }
    }
  },
  {
    method: 'POST',
    path: '/data/seed',
    handler: DataController.seed,
    options: {
      description: 'Used to seed test data in the database',
      app: { excludeFromProd: true }
    }
  }
]

module.exports = routes
