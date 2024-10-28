'use strict'

const BillRunsReviewController = require('../controllers/bill-runs-review.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-runs/review/{id}',
    options: {
      handler: BillRunsReviewController.review,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/review/{id}',
    options: {
      handler: BillRunsReviewController.submitReview,
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
  }
]

module.exports = routes
