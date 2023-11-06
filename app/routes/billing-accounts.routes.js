'use strict'

const BillingAccountsController = require('../controllers/billing-accounts.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/billing-accounts/{invoiceAccountId}/change-address',
    handler: BillingAccountsController.changeAddress,
    options: {
      app: {
        plainOutput: true
      },
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      description: 'Used updating a billing account with a new address'
    }
  },

  {
    method: 'GET',
    path: '/billing/batch/{batchId}/two-part-tariff-sroc-review',
    handler: BillingAccountsController.billingTptSrocPage,
    options: {
      app: {
        plainOutput: true
      },
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      description: 'Used updating a billing account with a new address'
    }
  }
]

module.exports = routes
