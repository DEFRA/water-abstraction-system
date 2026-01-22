'use strict'

const CompanyContactsController = require('../controllers/company-contacts.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/company-contacts/{id}',
    options: {
      handler: CompanyContactsController.viewCompanyContact
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/{id}/remove',
    options: {
      handler: CompanyContactsController.viewRemoveCompanyContact,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/{id}/remove',
    options: {
      handler: CompanyContactsController.submitRemoveCompanyContact,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  }
]

module.exports = routes
