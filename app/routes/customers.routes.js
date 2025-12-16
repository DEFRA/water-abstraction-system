'use strict'

const CustomersController = require('../controllers/customers.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/customers/{id}/contacts',
    options: {
      handler: CustomersController.viewContact,
      auth: {}
    }
  }
]

module.exports = routes
