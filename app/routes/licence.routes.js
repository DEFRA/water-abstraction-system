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
      }
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/communications',
    handler: LicencesController.viewCommunications
  },
  {
    method: 'GET',
    path: '/licences/{id}/contact-details',
    handler: LicencesController.viewContacts
  },
  {
    method: 'GET',
    path: '/licences/{id}/set-up',
    handler: LicencesController.viewSetUp,
    options: {
      auth: {
        access: {
          scope: ['view_charge_versions']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/summary',
    handler: LicencesController.viewSummary
  },
  {
    method: 'GET',
    path: '/licences/{id}/returns',
    handler: LicencesController.viewReturns
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
      }
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
      }
    }
  }
]

module.exports = routes
