'use strict'

const TestSupplementaryController = require('../controllers/test/supplementary.controller')

const routes = [
  {
    method: 'GET',
    path: '/test/supplementary',
    handler: TestSupplementaryController.index,
    options: {
      description: 'Test endpoint which returns all selected charge versions'
    }
  }
]

module.exports = routes
