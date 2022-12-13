'use strict'

const BillRunsController = require('../controllers/bill-runs.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/bill-runs',
    handler: BillRunsController.createBillRun,
    options: {
      description: 'Used to create a bill run'
    }
  }
]

module.exports = routes
