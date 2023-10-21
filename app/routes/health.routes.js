'use strict'

const HealthController = require('../controllers/health.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/health/airbrake',
    handler: HealthController.airbrake,
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      description: 'Used by the delivery team to confirm error logging is working correctly in an environment. ' +
        'NOTE. We expect this endpoint to return a 500'
    }
  },
  {
    method: 'GET',
    path: '/health/database',
    handler: HealthController.database,
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      description: 'Used by the delivery team to confirm we can connect to the database. It also returns us some ' +
        'useful stats about each table.'
    }
  },
  {
    method: 'GET',
    path: '/health/info',
    handler: HealthController.info,
    options: {
      auth: {
        // NOTE: this means any request credentials are attempted authentication, but if the credentials are invalid,
        // the request proceeds regardless of the authentication error. We do this so we can display the change
        // password and sign out links in the header _if_ the user is authenticated. But you don't need to be
        // authenticated to see this page. So, if you have no creds or you are running with an expired cookie we don't
        // care, you'll just not see the links.
        mode: 'try'
      },
      description: 'Used by the delivery team to confirm we can connect to our other apps and services. It also ' +
      'returns us the version and commit hash for each one.'
    }
  }
]

module.exports = routes
