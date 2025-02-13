'use strict'

const ReturnSubmissionsController = require('../controllers/return-submissions.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-submissions/{returnSubmissionId}/{yearMonth}',
    options: {
      handler: ReturnSubmissionsController.view
    }
  }
]

module.exports = routes
