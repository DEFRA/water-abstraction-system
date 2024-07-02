'use strict'

const JobsController = require('../controllers/jobs.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/jobs/export',
    options: {
      handler: JobsController.exportDb,
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/jobs/licence-updates',
    options: {
      handler: JobsController.licenceUpdates,
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/jobs/session-cleanup',
    options: {
      handler: JobsController.sessionCleanup,
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/jobs/time-limited',
    options: {
      handler: JobsController.timeLimited,
      app: {
        plainOutput: true
      },
      auth: false
    }
  }
]

module.exports = routes
