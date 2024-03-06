'use strict'

const BillRunsCreateController = require('../controllers/bill-runs-create.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-runs/create',
    handler: BillRunsCreateController.create,
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
    path: '/bill-runs/create/{sessionId}/region',
    handler: BillRunsCreateController.region,
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
    path: '/bill-runs/create/{sessionId}/region',
    handler: BillRunsCreateController.submitRegion,
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
    path: '/bill-runs/create/{sessionId}/season',
    handler: BillRunsCreateController.season,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Select the season for the bill run'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/create/{sessionId}/season',
    handler: BillRunsCreateController.submitSeason,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the season for the bill run'
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/create/{sessionId}/type',
    handler: BillRunsCreateController.type,
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
    path: '/bill-runs/create/{sessionId}/type',
    handler: BillRunsCreateController.submitType,
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
    path: '/bill-runs/create/{sessionId}/year',
    handler: BillRunsCreateController.year,
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
    path: '/bill-runs/create/{sessionId}/year',
    handler: BillRunsCreateController.submitYear,
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
