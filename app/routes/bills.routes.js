'use strict'

const BillsController = require('../controllers/bills.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/bills/{id}',
    handler: BillsController.view,
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
    path: '/bills/{id}/remove',
    handler: BillsController.remove,
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
    path: '/bills/{id}/remove',
    handler: BillsController.submitRemove,
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
