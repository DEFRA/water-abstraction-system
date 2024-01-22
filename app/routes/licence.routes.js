'use strict'

const LicencesController = require('../controllers/licences.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/licences/{id}',
    handler: LicencesController.view,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'View a licence page'
    }
  }, {
    method: 'GET',
    path: '/licences/{id}/no-returns-required',
    handler: LicencesController.noReturnsRequired,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Start no returns required set up journey (return-requirements)'
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/returns-required',
    handler: LicencesController.returnsRequired,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Start returns required set up journey (return-requirements)'
    }
  }
]

module.exports = routes
