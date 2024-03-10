'use strict'

const BillRunsSetupController = require('../controllers/bill-runs-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-runs/setup',
    handler: BillRunsSetupController.setup,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Create a bill run (start of journey)'
    }
  }
]

module.exports = routes
