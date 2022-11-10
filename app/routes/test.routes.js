'use strict'

const SupplementaryController = require('../controllers/test/supplementary.controller')

const routes = [
  {
    method: 'GET',
    path: '/test/supplementary',
    handler: SupplementaryController.index,
    options: {
      description: 'Test endpoint which returns all selected charge versions'
    }
  }
]

module.exports = routes
