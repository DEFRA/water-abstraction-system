'use strict'

const BillLicencesController = require('../controllers/bill-licences.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-licences/{id}',
    handler: BillLicencesController.view,
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
    path: '/bill-licences/{id}/remove',
    handler: BillLicencesController.remove,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-licences/{id}/remove',
    handler: BillLicencesController.submitRemove,
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
