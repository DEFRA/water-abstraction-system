'use strict'

const CompanyContactsController = require('../controllers/company-contacts.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/company-contacts/{id}/communications',
    options: {
      handler: CompanyContactsController.viewCommunications
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/{id}/contact-details',
    options: {
      handler: CompanyContactsController.viewContactDetails
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
