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
  }
]

module.exports = routes
