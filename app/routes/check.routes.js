'use strict'

const CheckController = require('../controllers/check/check.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/check/two-part',
    handler: CheckController.twoPart,
    options: {
      description: 'Used by the delivery team to check the SROC 2PT billing logic',
      app: { excludeFromProd: true }
    }
  }
]

module.exports = routes
