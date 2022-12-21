'use strict'

const SupplementaryController = require('../controllers/check/supplementary.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/check/supplementary',
    handler: SupplementaryController.index,
    options: {
      description: 'Used by the delivery team to check the SROC supplementary billing logic'
    }
  }
]

module.exports = routes
