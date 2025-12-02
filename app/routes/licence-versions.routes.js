'use strict'

const LicenceVersionsController = require('../controllers/licence-versions.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/licence-versions/{id}',
    options: {
      handler: LicenceVersionsController.view
    }
  }
]

module.exports = routes
