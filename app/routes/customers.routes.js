'use strict'

const CustomersController = require('../controllers/customers.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/customers/{id}/billing-accounts',
    options: {
      handler: CustomersController.viewBillingAccounts,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/customers/{id}/contacts',
    options: {
      handler: CustomersController.viewContact
    }
  },
  {
    method: 'GET',
    path: '/customers/{id}/licences',
    options: {
      handler: CustomersController.viewLicences
    }
  }
]

module.exports = routes
