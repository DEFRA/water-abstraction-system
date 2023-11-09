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
    method: 'GET',
    path: '/check/two-part-review/{licenceId}',
    handler: CheckController.twoPartReview,
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
