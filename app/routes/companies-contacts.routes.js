'use strict'

const CustomersContactsController = require('../controllers/company-contacts.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/companies-contacts/{id}',
    options: {
      handler: CustomersContactsController.viewManage
    }
  }
]

module.exports = routes
