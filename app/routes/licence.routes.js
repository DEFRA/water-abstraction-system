'use strict'

const LicencesController = require('../controllers/licences.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/licences/{id}/summary',
    handler: LicencesController.viewSummary,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'View a summary licence page'
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/returns',
    handler: LicencesController.viewReturns,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'View a returns licence page'
    }
  },
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
