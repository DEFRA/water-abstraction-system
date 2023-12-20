'use strict'

const LicencesController = require('../controllers/licences.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/licences/{id}/no-returns-required',
    handler: LicencesController.noReturnsRequired,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Review two-part tariff match and allocation results'
    }
  }
]

module.exports = routes
