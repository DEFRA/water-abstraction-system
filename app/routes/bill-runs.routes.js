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
    path: '/bill-runs/{id}',
    handler: BillRunsController.view,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'View a bill run'
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/cancel',
    handler: BillRunsController.cancelConfirmation,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Request confirmation to cancel a bill run'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/{id}/cancel',
    handler: BillRunsController.cancel,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Cancel a bill run'
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/review',
    handler: BillRunsController.review,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Review two-part tariff match and allocation results'
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/review/{licenceId}',
    handler: BillRunsController.reviewLicence,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Review a two-part tariff licence'
    }
  }
]

module.exports = routes
