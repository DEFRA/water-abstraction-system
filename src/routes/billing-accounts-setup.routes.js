/**
 * Routes for the /billing-accounts/setup endpoints
 *
 * @module BillingAccountsSetupRoutes
 */

import {
  setup,
  submitAccount,
  submitAccountType,
  submitCheck,
  submitCompanySearch,
  submitContact,
  submitContactName,
  submitExistingAccount,
  submitExistingAddress,
  submitFAO,
  submitSelectCompany,
  viewAccount,
  viewAccountType,
  viewCheck,
  viewCompanySearch,
  viewContact,
  viewContactName,
  viewExistingAccount,
  viewExistingAddress,
  viewFAO,
  viewSelectCompany
} from '../controllers/billing-accounts-setup.controller.js'

export default [
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: setup
    },
    path: '/billing-accounts/setup/{billingAccountId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewAccount
    },
    path: '/billing-accounts/setup/{sessionId}/account'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitAccount
    },
    path: '/billing-accounts/setup/{sessionId}/account'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewExistingAddress
    },
    path: '/billing-accounts/setup/{sessionId}/existing-address'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitExistingAddress
    },
    path: '/billing-accounts/setup/{sessionId}/existing-address'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewExistingAccount
    },
    path: '/billing-accounts/setup/{sessionId}/existing-account'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitExistingAccount
    },
    path: '/billing-accounts/setup/{sessionId}/existing-account'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewFAO
    },
    path: '/billing-accounts/setup/{sessionId}/fao'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitFAO
    },
    path: '/billing-accounts/setup/{sessionId}/fao'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewCheck
    },
    path: '/billing-accounts/setup/{sessionId}/check'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitCheck
    },
    path: '/billing-accounts/setup/{sessionId}/check'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewAccountType
    },
    path: '/billing-accounts/setup/{sessionId}/account-type'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitAccountType
    },
    path: '/billing-accounts/setup/{sessionId}/account-type'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewContact
    },
    path: '/billing-accounts/setup/{sessionId}/contact'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitContact
    },
    path: '/billing-accounts/setup/{sessionId}/contact'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewContactName
    },
    path: '/billing-accounts/setup/{sessionId}/contact-name'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitContactName
    },
    path: '/billing-accounts/setup/{sessionId}/contact-name'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewCompanySearch
    },
    path: '/billing-accounts/setup/{sessionId}/company-search'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitCompanySearch
    },
    path: '/billing-accounts/setup/{sessionId}/company-search'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: viewSelectCompany
    },
    path: '/billing-accounts/setup/{sessionId}/select-company'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: submitSelectCompany
    },
    path: '/billing-accounts/setup/{sessionId}/select-company'
  }
]
