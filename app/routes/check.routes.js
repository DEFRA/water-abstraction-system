'use strict'

const CheckController = require('../controllers/check.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/check/two-part/{naldRegionId}',
    handler: CheckController.twoPart,
    options: {
      auth: false,
      description: 'Used by the delivery team to check the SROC 2PT billing logic for all licences in a region',
      app: {
        excludeFromProd: true,
        plainOutput: true
      }
    }
  },
  {
    method: 'GET',
    path: '/check/two-part-licence/{licenceId}',
    handler: CheckController.twoPartLicence,
    options: {
      auth: false,
      description: 'Used by the delivery team to check the SROC 2PT billing logic for a single licence',
      app: {
        excludeFromProd: true,
        plainOutput: true
      }
    }
  }
]

module.exports = routes
