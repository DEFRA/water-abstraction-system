'use strict'

const BillingAccountsController = require('../controllers/billing-accounts.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/billing-accounts/{invoiceAccountId}/change-address',
    handler: BillingAccountsController.changeAddress,
    options: {
      description: 'Used updating a billing account with a new address',
      app: {
        plainOutput: true
      }
    }
  }
]

module.exports = routes
