'use strict'

const BillRunsController = require('../controllers/bill-runs.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-runs',
    handler: BillRunsController.index,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'List all bill runs'
    }
  },
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
    path: '/bill-runs/{id}/remove/{licenceId}',
    handler: BillRunsController.removeLicence,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Confirm removing a licence from a bill run'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/{id}/remove/{licenceId}',
    handler: BillRunsController.submitRemoveLicence,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit licence removal from a bill run'
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
    handler: BillRunsController.submitReview,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'POST request received when filtering applied to review two-part tariff match and allocation results'
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
    handler: BillRunsController.submitReviewLicence,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'POST request received when progress marking is applied to review a two-part tariff licence'
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/review/{licenceId}/charge-reference-details/{reviewChargeReferenceId}',
    handler: BillRunsController.chargeReferenceDetails,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Review a charge reference from a two-part tariff licence'
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/review/{licenceId}/charge-reference-details/{reviewChargeReferenceId}/amend-authorised-volume',
    handler: BillRunsController.amendAuthorisedVolume,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Amend a charge references authorised volume from a two-part tariff licence'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/{id}/review/{licenceId}/charge-reference-details/{reviewChargeReferenceId}/amend-authorised-volume',
    handler: BillRunsController.submitAmendedAuthorisedVolume,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the amended charge references authorised volume from a two-part tariff licence'
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/review/{licenceId}/charge-reference-details/{reviewChargeReferenceId}/amend-adjustment-factor',
    handler: BillRunsController.amendAdjustmentFactor,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Amend a charge references adjustment factors from a two-part tariff licence'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/{id}/review/{licenceId}/charge-reference-details/{reviewChargeReferenceId}/amend-adjustment-factor',
    handler: BillRunsController.submitAmendedAdjustmentFactor,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the amended charge references adjustment factors from a two-part tariff licence'
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
    path: '/bill-runs/{id}/review/{licenceId}/match-details/{reviewChargeElementId}/amend-billable-returns',
    handler: BillRunsController.amendBillableReturns,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Amend the billable return volumes on a charge element'
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/{id}/review/{licenceId}/match-details/{reviewChargeElementId}/amend-billable-returns',
    handler: BillRunsController.submitAmendedBillableReturns,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the amended billable return volumes on a charge element'
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
