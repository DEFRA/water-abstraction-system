'use strict'

const CustomersContactController = require('../controllers/customers-contact.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/customers/{customerId}/contact/{contactId}',
    options: {
      handler: CustomersContactController.viewManage
    }
  }
]

module.exports = routes
