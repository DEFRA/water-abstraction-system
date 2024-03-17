'use strict'

const BillLicencesController = require('../controllers/bill-licences.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bill-licences/{id}',
    options: {
      handler: BillLicencesController.view,
      description: "Used to view a bill licence and it's transactions",
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
      description: 'Confirm licence should be removed from bill run page',
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
