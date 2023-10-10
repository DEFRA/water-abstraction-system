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
      description: 'Used by the delivery team to check the SROC 2PT billing logic'
    }
  }
]

module.exports = routes
