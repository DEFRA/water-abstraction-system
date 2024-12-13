'use strict'

const BillRunsSetupController = require('../controllers/bill-runs-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/check',
    options: {
      handler: BillRunsSetupController.check,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/check',
    options: {
      handler: BillRunsSetupController.submitCheck,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/no-licences',
    options: {
      handler: BillRunsSetupController.noLicences,
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
    options: {
      handler: BillRunsSetupController.region,
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
    options: {
      handler: BillRunsSetupController.submitRegion,
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
    options: {
      handler: BillRunsSetupController.season,
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
    options: {
      handler: BillRunsSetupController.submitSeason,
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
    options: {
      handler: BillRunsSetupController.setup,
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
    options: {
      handler: BillRunsSetupController.type,
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
    options: {
      handler: BillRunsSetupController.submitType,
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
    options: {
      handler: BillRunsSetupController.year,
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
    options: {
      handler: BillRunsSetupController.submitYear,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
