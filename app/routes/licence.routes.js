'use strict'

const LicencesController = require('../controllers/licences.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/licences/{id}/bills',
    handler: LicencesController.viewBills,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'View a licence bills page'
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/licence-set-up',
    handler: LicencesController.viewSetUp,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'View a licence set up page'
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/communications',
    handler: LicencesController.viewCommunications,
    options: {
      description: 'View a licence communications page'
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/contact-details',
    handler: LicencesController.viewContacts,
    options: {
      description: 'View a licence contacts page'
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/summary',
    handler: LicencesController.viewSummary,
    options: {
      description: 'View a licence summary page'
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/returns',
    handler: LicencesController.viewReturns,
    options: {
      description: 'View a licence returns page'
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
