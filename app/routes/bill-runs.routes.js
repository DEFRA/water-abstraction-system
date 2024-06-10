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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/review/{licenceId}/preview-charge/{reviewChargeReferenceId}',
    handler: BillRunsController.previewCharge,
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
    path: '/bill-runs/{id}/send',
    handler: BillRunsController.send,
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
    path: '/bill-runs/{id}/send',
    handler: BillRunsController.submitSend,
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
