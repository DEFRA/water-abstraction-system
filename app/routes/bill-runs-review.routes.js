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

const routes = [
  {
    method: 'GET',
    path: '/bill-runs/review/{billRunId}',
    options: {
      handler: viewReview,
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
      handler: submitReview,
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
      handler: viewReviewChargeElement,
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
      handler: viewEdit,
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
      handler: submitEdit,
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
      handler: viewReviewChargeReference,
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
      handler: viewAuthorised,
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
      handler: submitAuthorised,
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
      handler: viewFactors,
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
      handler: submitFactors,
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
      handler: preview,
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
      handler: viewReviewLicence,
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
      handler: submitReviewLicence,
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
      handler: viewRemove,
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
      handler: submitRemove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

export default routes
