'use strict'

const BillLicencesController = require('../controllers/bill-licences.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-licences/{id}',
    options: {
      handler: BillLicencesController.view,
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
    options: {
      handler: BillLicencesController.remove,
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
    options: {
      handler: BillLicencesController.submitRemove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
