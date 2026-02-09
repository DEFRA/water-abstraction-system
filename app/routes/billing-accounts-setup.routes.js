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
    path: '/billing-accounts/setup/{sessionId}/account',
    options: {
      handler: BillingAccountsSetupController.viewAccount,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/account',
    options: {
      handler: BillingAccountsSetupController.submitAccount,
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
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/fao',
    options: {
      handler: BillingAccountsSetupController.viewFAO,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/fao',
    options: {
      handler: BillingAccountsSetupController.submitFAO,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/check',
    options: {
      handler: BillingAccountsSetupController.viewCheck,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/check',
    options: {
      handler: BillingAccountsSetupController.submitCheck,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/account-type',
    options: {
      handler: BillingAccountsSetupController.viewAccountType,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/account-type',
    options: {
      handler: BillingAccountsSetupController.submitAccountType,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/contact',
    options: {
      handler: BillingAccountsSetupController.viewContact,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/contact',
    options: {
      handler: BillingAccountsSetupController.submitContact,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/contact-name',
    options: {
      handler: BillingAccountsSetupController.viewContactName,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/contact-name',
    options: {
      handler: BillingAccountsSetupController.submitContactName,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/company-search',
    options: {
      handler: BillingAccountsSetupController.viewCompanySearch,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/company-search',
    options: {
      handler: BillingAccountsSetupController.submitCompanySearch,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  }
]

module.exports = routes
