'use strict'

const SupplementaryController = require('../controllers/check/supplementary.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/check/supplementary',
    handler: SupplementaryController.index,
    options: {
      description: 'Endpoint to check the SROC supplementary billing logic'
    }
  }
]

module.exports = routes
