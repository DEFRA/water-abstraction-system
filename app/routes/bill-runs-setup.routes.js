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
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/type',
    handler: BillRunsSetupController.type,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Select the bill run type'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/type',
    handler: BillRunsSetupController.submitType,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the bill run type for the bill run'
    }
  }
]

module.exports = routes
