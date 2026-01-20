'use strict'

const CustomersContactsController = require('../controllers/customers-contacts.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/customers-contacts/{id}',
    options: {
      handler: CustomersContactsController.viewManage
    }
  }
]

module.exports = routes
