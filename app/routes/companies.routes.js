'use strict'

const CompaniesController = require('../controllers/companies.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/companies/{id}/billing-accounts',
    options: {
      handler: CompaniesController.viewBillingAccounts,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/companies/{id}/contacts',
    options: {
      handler: CompaniesController.viewContact
    }
  },
  {
    method: 'GET',
    path: '/companies/{id}/licences',
    options: {
      handler: CompaniesController.viewLicences
    }
  }
]

module.exports = routes
