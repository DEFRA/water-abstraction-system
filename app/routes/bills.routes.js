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
  },
  {
    method: 'GET',
    path: '/bills/{id}/remove',
    options: {
      handler: BillsController.remove,
      description: 'Confirm bill should be removed from bill run page',
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
    options: {
      handler: BillsController.submitRemove,
      description: 'Submit confirm bill should be removed from bill run',
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
