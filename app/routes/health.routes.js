'use strict'

const HealthController = require('../controllers/health.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/health/airbrake',
    options: {
      handler: HealthController.airbrake,
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/health/database',
    options: {
      handler: HealthController.database,
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/health/info',
    options: {
      handler: HealthController.info,
      auth: {
        // NOTE: this means any request credentials are attempted authentication, but if the credentials are invalid,
        // the request proceeds regardless of the authentication error. We do this so we can display the change
        // password and sign out links in the header _if_ the user is authenticated. But you don't need to be
        // authenticated to see this page. So, if you have no creds or you are running with an expired cookie we don't
        // care, you'll just not see the links.
        mode: 'try'
      }
    }
  }
]

module.exports = routes
