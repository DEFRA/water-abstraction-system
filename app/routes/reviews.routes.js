'use strict'

const ReviewsController = require('../controllers/reviews.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/reviews/{billRunId}',
    handler: ReviewsController.view,
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
    path: '/reviews/{billRunId}',
    handler: ReviewsController.view,
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
    path: '/reviews/{billRunId}/licences/{licenceId}',
    handler: ReviewsController.viewLicence,
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
