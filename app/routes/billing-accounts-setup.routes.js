'use strict'

const BillingAccountsSetupController = require('../controllers/billing-accounts-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/billing-accounts/setup/{billingAccountId}/select-account',
    options: {
      handler: BillingAccountsSetupController.viewSelectAccount,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{billingAccountId}/select-account',
    options: {
      handler: BillingAccountsSetupController.submitSelectAccount,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
