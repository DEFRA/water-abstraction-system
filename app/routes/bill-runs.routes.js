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
    handler: BillRunsController.cancel,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Confirm cancel a bill run'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/{id}/cancel',
    handler: BillRunsController.submitCancel,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit bill run cancellation'
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
    method: 'POST',
    path: '/bill-runs/{id}/review',
    handler: BillRunsController.review,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'POST request recieved when filtering applied to review two-part tariff match and allocation results'
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
  },
  {
    method: 'POST',
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
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/review/{licenceId}/match-details/{reviewChargeElementId}',
    handler: BillRunsController.matchDetails,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'View match details of a charge element'
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/send',
    handler: BillRunsController.send,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Confirm (send) a bill run'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/{id}/send',
    handler: BillRunsController.submitSend,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit bill run (send) confirmation'
    }
  }
]

module.exports = routes
