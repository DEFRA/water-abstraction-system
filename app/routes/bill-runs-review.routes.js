'use strict'

const BillRunsReviewController = require('../controllers/bill-runs-review.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-runs/review/{billRunId}',
    options: {
      handler: BillRunsReviewController.reviewBillRun,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/review/{billRunId}',
    options: {
      handler: BillRunsReviewController.submitReviewBillRun,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}',
    options: {
      handler: BillRunsReviewController.reviewChargeElement,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}/edit',
    options: {
      handler: BillRunsReviewController.edit,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}/edit',
    options: {
      handler: BillRunsReviewController.submitEdit,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}',
    options: {
      handler: BillRunsReviewController.reviewChargeReference,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/authorised',
    options: {
      handler: BillRunsReviewController.authorised,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/authorised',
    options: {
      handler: BillRunsReviewController.submitAuthorised,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/factors',
    options: {
      handler: BillRunsReviewController.factors,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/factors',
    options: {
      handler: BillRunsReviewController.submitFactors,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/preview',
    options: {
      handler: BillRunsReviewController.preview,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/review/licence/{reviewLicenceId}',
    options: {
      handler: BillRunsReviewController.reviewLicence,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/review/licence/{reviewLicenceId}',
    options: {
      handler: BillRunsReviewController.submitReviewLicence,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/review/licence/{reviewLicenceId}/remove',
    options: {
      handler: BillRunsReviewController.remove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/review/licence/{reviewLicenceId}/remove',
    options: {
      handler: BillRunsReviewController.submitRemove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
