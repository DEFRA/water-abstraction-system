'use strict'

const CompaniesController = require('../controllers/companies.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/companies/{id}/{role}',
    options: {
      handler: CompaniesController.viewCompany
    }
  },
  {
    method: 'GET',
    path: '/companies/{id}/address/{addressId}/{role}',
    options: {
      handler: CompaniesController.viewCompanyWithAddress
    }
  },
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
      handler: CompaniesController.viewContacts
    }
  },
  {
    method: 'GET',
    path: '/companies/{id}/history',
    options: {
      handler: CompaniesController.viewHistory
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
