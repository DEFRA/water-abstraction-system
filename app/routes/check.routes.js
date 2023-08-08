'use strict'

const CheckController = require('../controllers/check/check.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/check/two-part/{naldRegionId}/{format?}',
    handler: CheckController.twoPart,
    options: {
      description: 'Used by the delivery team to check the SROC 2PT billing logic',
      app: { excludeFromProd: true }
    }
  }
]

module.exports = routes
