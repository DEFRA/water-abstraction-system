'use strict'

const CheckController = require('../controllers/check.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/check/two-part/{naldRegionId}',
    handler: CheckController.twoPart,
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      description: 'Used by the delivery team to check the SROC 2PT billing logic for all licences in a region'
    }
  },
  {
    method: 'GET',
    path: '/check/two-part-licence/{licenceId}',
    handler: CheckController.twoPartLicence,
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      description: 'Used by the delivery team to check the SROC 2PT billing logic for a single licence'
    }
  },
  {
    // Used on the alternate branch
    method: 'GET',
    path: '/check/two-part-review',
    handler: CheckController.twoPartReview,
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      description: 'Used by the delivery team to check the SROC 2PT billing logic for a region'
    }
  },
  {
    // Used on the alternate branch
    method: 'GET',
    path: '/check/two-part-review/{licenceId}',
    handler: CheckController.twoPartReviewLicence,
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      description: 'Used by the delivery team to check the SROC 2PT billing logic for a single licence'
    }
  }
]

module.exports = routes
