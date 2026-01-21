'use strict'

const CompanyContactsController = require('../controllers/company-contacts.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/company-contacts/{id}',
    options: {
      handler: CompanyContactsController.viewCompanyContact
    }
  }
]

module.exports = routes
