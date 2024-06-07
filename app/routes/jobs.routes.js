'use strict'

const JobsController = require('../controllers/jobs.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/jobs/export',
    handler: JobsController.exportDb,
    options: {
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/jobs/licence-updates',
    handler: JobsController.licenceUpdates,
    options: {
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/jobs/time-limited',
    handler: JobsController.timeLimited,
    options: {
      app: {
        plainOutput: true
      },
      auth: false
    }
  }
]

module.exports = routes
