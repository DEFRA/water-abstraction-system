'use strict'

const JobsController = require('../controllers/jobs.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/jobs/time-limited',
    handler: JobsController.timeLimited,
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      description: 'Puts a licence into workflow when a charge element has a `timeLimitedEndDate` which is < 50 days away'
    }
  }
]

module.exports = routes
