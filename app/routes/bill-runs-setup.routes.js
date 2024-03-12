'use strict'

const BillRunsSetupController = require('../controllers/bill-runs-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/create',
    handler: BillRunsSetupController.create,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Attempt to create a new bill run'
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/region',
    handler: BillRunsSetupController.region,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Select the region for the bill run'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/region',
    handler: BillRunsSetupController.submitRegion,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the region for the bill run'
    }
  },
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
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/year',
    handler: BillRunsSetupController.year,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Select the financial year for the bill run'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/year',
    handler: BillRunsSetupController.submitYear,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the financial year for the bill run'
    }
  }
]

module.exports = routes
