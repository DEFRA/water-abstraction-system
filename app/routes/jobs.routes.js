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
      auth: false,
      plugins: {
        crumb: false
      }
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
      auth: false,
      plugins: {
        crumb: false
      }
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
      auth: false,
      plugins: {
        crumb: false
      }
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
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/return-logs/{cycle}',
    options: {
      handler: JobsController.returnLogs,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/return-version-migration',
    options: {
      handler: JobsController.returnVersionMigration,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  }
]

module.exports = routes
