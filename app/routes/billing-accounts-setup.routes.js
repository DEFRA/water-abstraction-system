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
    path: '/billing-accounts/setup/{sessionId}/select-existing-address',
    options: {
      handler: BillingAccountsSetupController.viewSelectExistingAddress,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/select-existing-address',
    options: {
      handler: BillingAccountsSetupController.submitSelectExistingAddress,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/for-attention-of',
    options: {
      handler: BillingAccountsSetupController.viewForAttentionOf,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/for-attention-of',
    options: {
      handler: BillingAccountsSetupController.submitForAttentionOf,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  }
]

module.exports = routes
