/**
 * Routes for the /bill-runs/review endpoints
 *
 * @module BillRunsReviewRoutes
 */

import {
  preview,
  submitAuthorised,
  submitEdit,
  submitFactors,
  submitRemove,
  submitReview,
  submitReviewLicence,
  viewAuthorised,
  viewEdit,
  viewFactors,
  viewRemove,
  viewReview,
  viewReviewChargeElement,
  viewReviewChargeReference,
  viewReviewLicence
} from '../controllers/bill-runs-review.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewReview
    },
    path: '/bill-runs/review/{billRunId}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitReview
    },
    path: '/bill-runs/review/{billRunId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewReviewChargeElement
    },
    path: '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewEdit
    },
    path: '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}/edit'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitEdit
    },
    path: '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}/edit'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewReviewChargeReference
    },
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewAuthorised
    },
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/authorised'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitAuthorised
    },
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/authorised'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewFactors
    },
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/factors'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitFactors
    },
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/factors'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: preview
    },
    path: '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/preview'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewReviewLicence
    },
    path: '/bill-runs/review/licence/{reviewLicenceId}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitReviewLicence
    },
    path: '/bill-runs/review/licence/{reviewLicenceId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewRemove
    },
    path: '/bill-runs/review/licence/{reviewLicenceId}/remove'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitRemove
    },
    path: '/bill-runs/review/licence/{reviewLicenceId}/remove'
  }
]
