'use strict'

const AirbrakeController = require('../controllers/health/airbrake.controller.js')
const DatabaseController = require('../controllers/health/database.controller.js')
const InfoController = require('../controllers/health/info.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/health/airbrake',
    handler: AirbrakeController.index,
    options: {
      description: 'Used by the delivery team to confirm error logging is working correctly in an environment. ' +
        'NOTE. We expect this endpoint to return a 500'
    }
  },
  {
    method: 'GET',
    path: '/health/database',
    handler: DatabaseController.index,
    options: {
      description: 'Used by the delivery team to confirm we can connect to the database. It also returns us some ' +
        'useful stats about each table.'
    }
  },
  {
    method: 'GET',
    path: '/health/info',
    handler: InfoController.index,
    options: {
      auth: false
    }
  }
]

module.exports = routes
