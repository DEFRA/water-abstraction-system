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

const routes = [
  {
    method: 'POST',
    path: '/billing-accounts/setup/{billingAccountId}',
    options: {
      handler: setup,
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
      handler: viewAccount,
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
      handler: submitAccount,
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
      handler: viewExistingAddress,
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
      handler: submitExistingAddress,
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
      handler: viewExistingAccount,
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
      handler: submitExistingAccount,
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
      handler: viewFAO,
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
      handler: submitFAO,
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
      handler: viewCheck,
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
      handler: submitCheck,
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
      handler: viewAccountType,
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
      handler: submitAccountType,
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
      handler: viewContact,
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
      handler: submitContact,
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
      handler: viewContactName,
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
      handler: submitContactName,
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
      handler: viewCompanySearch,
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
      handler: submitCompanySearch,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/billing-accounts/setup/{sessionId}/select-company',
    options: {
      handler: viewSelectCompany,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/setup/{sessionId}/select-company',
    options: {
      handler: submitSelectCompany,
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      }
    }
  }
]

export default routes
