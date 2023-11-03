'use strict'

const BillsController = require('../controllers/bills.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bills/{id}',
    options: {
      handler: BillsController.view,
      description: 'Used to view a bill',
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
