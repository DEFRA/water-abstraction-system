'use strict'

const ReturnSubmissionsController = require('../controllers/return-submissions.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-submissions/{returnSubmissionId}/{monthIndex}',
    options: {
      handler: ReturnSubmissionsController.view
    }
  }
]

module.exports = routes
