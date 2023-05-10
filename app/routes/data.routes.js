'use strict'

const DataController = require('../controllers/data/data.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/data/tear-down',
    handler: DataController.tearDown,
    options: {
      description: 'Used to remove the integration test data from the database',
      app: { excludeFromProd: true }
    }
  }
]

module.exports = routes
