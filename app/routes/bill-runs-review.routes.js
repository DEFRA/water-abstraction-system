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
  }
]

module.exports = routes