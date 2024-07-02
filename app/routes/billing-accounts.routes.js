'use strict'

const BillingAccountsController = require('../controllers/billing-accounts.controller.js')

const routes = [
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
      }
    }
  }
]

module.exports = routes
