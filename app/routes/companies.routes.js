import {
  viewBillingAccounts,
  viewCompany,
  viewCompanyWithAddress,
  viewContacts,
  viewHistory,
  viewLicences
} from '../controllers/companies.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/companies/{id}/{role}',
    options: {
      handler: viewCompany
    }
  },
  {
    method: 'GET',
    path: '/companies/{id}/address/{addressId}/{role}',
    options: {
      handler: viewCompanyWithAddress
    }
  },
  {
    method: 'GET',
    path: '/companies/{id}/billing-accounts',
    options: {
      handler: viewBillingAccounts,
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
      handler: viewContacts
    }
  },
  {
    method: 'GET',
    path: '/companies/{id}/history',
    options: {
      handler: viewHistory
    }
  },
  {
    method: 'GET',
    path: '/companies/{id}/licences',
    options: {
      handler: viewLicences
    }
  }
]

export default routes
