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
  },
  {
    method: 'GET',
    path: '/customers/{id}/licences',
    options: {
      handler: CustomersController.viewLicences,
      auth: {}
    }
  }
]

module.exports = routes
