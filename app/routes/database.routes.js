'use strict'

const DatabaseController = require('../controllers/health/database.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/health/database',
    handler: DatabaseController.index,
    options: {
      description: 'Used by the delivery team to confirm we can connect to the database. It also returns us some ' +
        'useful stats about each table.'
    }
  }
]

module.exports = routes
