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
      }
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
      }
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
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/season',
    handler: BillRunsSetupController.season,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/season',
    handler: BillRunsSetupController.submitSeason,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
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
      }
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
      }
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
      }
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
      }
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
      }
    }
  }
]

module.exports = routes
