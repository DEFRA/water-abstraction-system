import {
  viewBillingAccounts,
  viewCompany,
  viewCompanyWithAddress,
  viewContacts,
  viewHistory,
  viewLicences
} from '../controllers/companies.controller.js'

export default [
  {
    method: 'GET',
    options: {
      handler: viewCompany
    },
    path: '/companies/{id}/{role}'
  },
  {
    method: 'GET',
    options: {
      handler: viewCompanyWithAddress
    },
    path: '/companies/{id}/address/{addressId}/{role}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewBillingAccounts
    },
    path: '/companies/{id}/billing-accounts'
  },
  {
    method: 'GET',
    options: {
      handler: viewContacts
    },
    path: '/companies/{id}/contacts'
  },
  {
    method: 'GET',
    options: {
      handler: viewHistory
    },
    path: '/companies/{id}/history'
  },
  {
    method: 'GET',
    options: {
      handler: viewLicences
    },
    path: '/companies/{id}/licences'
  }
]
