'use strict'

const BillingAccountsController = require('../controllers/billing-accounts.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/billing-accounts/{billingAccountId}',
    options: {
      handler: BillingAccountsController.view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/{billingAccountId}/change-address',
    options: {
      handler: BillingAccountsController.changeAddress,
      app: {
        plainOutput: true
      },
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      plugins: {
        crumb: false
      }
    }
  }
]

module.exports = routes
