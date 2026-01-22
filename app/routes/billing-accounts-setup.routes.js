'use strict'

const BillingAccountsSetupController = require('../controllers/billing-accounts-setup.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/billing-accounts/setup/{billingAccountId}',
    options: {
      handler: BillingAccountsSetupController.setup,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/select-account',
    options: {
      handler: BillingAccountsSetupController.viewSelectAccount,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/select-account',
    options: {
      handler: BillingAccountsSetupController.submitSelectAccount,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/existing-address',
    options: {
      handler: BillingAccountsSetupController.viewExistingAddress,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/existing-address',
    options: {
      handler: BillingAccountsSetupController.submitExistingAddress,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/existing-account',
    options: {
      handler: BillingAccountsSetupController.viewExistingAccount,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/existing-account',
    options: {
      handler: BillingAccountsSetupController.submitExistingAccount,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  }
]

module.exports = routes
