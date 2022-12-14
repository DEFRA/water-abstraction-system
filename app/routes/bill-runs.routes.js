'use strict'

const BillRunsController = require('../controllers/bill-runs/bill-runs.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/bill-runs',
    handler: BillRunsController.create,
    options: {
      description: 'Used to create a bill run',
      plugins: {
        errorPages: {
          plainOutput: true
        }
      }
    }
  }
]

module.exports = routes
