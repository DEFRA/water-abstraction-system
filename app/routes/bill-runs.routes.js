'use strict'

const BillRunsController = require('../controllers/bill-runs.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/bill-runs',
    handler: BillRunsController.create,
    options: {
      app: {
        plainOutput: true
      },
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Used to create a bill run'
    }
  },

  {
    method: 'GET',
    path: '/bill-runs/{id}/review',
    handler: BillRunsController.review,
    options: {
      app: {
        plainOutput: true
      },
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Used to review sroc returns data'
    }
  }
]

module.exports = routes
