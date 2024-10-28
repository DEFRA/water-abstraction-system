'use strict'

const BillRunsController = require('../controllers/bill-runs.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-runs',
    options: {
      handler: BillRunsController.index,
      auth: {
        access: {
          scope: ['billing']
        }
      },
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}',
    options: {
      handler: BillRunsController.view,
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
    options: {
      handler: BillRunsController.cancel,
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
    options: {
      handler: BillRunsController.submitCancel,
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
    options: {
      handler: BillRunsController.removeLicence,
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
    options: {
      handler: BillRunsController.submitRemoveLicence,
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
    options: {
      handler: BillRunsController.amendAuthorisedVolume,
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
    options: {
      handler: BillRunsController.submitAmendedAuthorisedVolume,
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
    options: {
      handler: BillRunsController.amendAdjustmentFactor,
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
    options: {
      handler: BillRunsController.submitAmendedAdjustmentFactor,
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
    options: {
      handler: BillRunsController.matchDetails,
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
    options: {
      handler: BillRunsController.amendBillableReturns,
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
    options: {
      handler: BillRunsController.submitAmendedBillableReturns,
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
    options: {
      handler: BillRunsController.previewCharge,
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
    options: {
      handler: BillRunsController.send,
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
    options: {
      handler: BillRunsController.submitSend,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/two-part-tariff',
    options: {
      handler: BillRunsController.twoPartTariff,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
