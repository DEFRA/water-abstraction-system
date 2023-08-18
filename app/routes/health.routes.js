'use strict'

const HealthController = require('../controllers/health.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/health/airbrake',
    handler: HealthController.airbrake,
    options: {
      description: 'Used by the delivery team to confirm error logging is working correctly in an environment. ' +
        'NOTE. We expect this endpoint to return a 500'
    }
  },
  {
    method: 'GET',
    path: '/health/database',
    handler: HealthController.database,
    options: {
      description: 'Used by the delivery team to confirm we can connect to the database. It also returns us some ' +
        'useful stats about each table.'
    }
  },
  {
    method: 'GET',
    path: '/health/info',
    handler: HealthController.info,
    options: {
      description: 'Used by the delivery team to confirm we can connect to our other apps and services. It also ' +
      'returns us the version and commit hash for each one.'
    }
  }
]

module.exports = routes
