import {
  setupExternal,
  setupInternal,
  setupInternalEdit,
  submitExternalCancel,
  submitExternalCheck,
  submitExternalLicences,
  submitInternalAccess,
  submitInternalCancel,
  submitInternalCheck,
  submitInternalEmail,
  submitInternalPermissions,
  viewExternalCancel,
  viewExternalCheck,
  viewExternalLicences,
  viewInternalAccess,
  viewInternalCancel,
  viewInternalCheck,
  viewInternalEmail,
  viewInternalPermissions
} from '../controllers/users-setup.controller.js'

export default [
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      },
      handler: setupExternal
    },
    path: '/users/external/{id}/setup'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      },
      handler: viewExternalCancel
    },
    path: '/users/external/setup/{sessionId}/cancel'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      },
      handler: submitExternalCancel
    },
    path: '/users/external/setup/{sessionId}/cancel'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      },
      handler: viewExternalCheck
    },
    path: '/users/external/setup/{sessionId}/check'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      },
      handler: submitExternalCheck
    },
    path: '/users/external/setup/{sessionId}/check'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      },
      handler: viewExternalLicences
    },
    path: '/users/external/setup/{sessionId}/licences'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      },
      handler: submitExternalLicences
    },
    path: '/users/external/setup/{sessionId}/licences'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: setupInternal
    },
    path: '/users/internal/setup'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: setupInternalEdit
    },
    path: '/users/internal/setup/{id}/edit'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: viewInternalAccess
    },
    path: '/users/internal/setup/{sessionId}/access'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: submitInternalAccess
    },
    path: '/users/internal/setup/{sessionId}/access'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: viewInternalCancel
    },
    path: '/users/internal/setup/{sessionId}/cancel'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: submitInternalCancel
    },
    path: '/users/internal/setup/{sessionId}/cancel'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: viewInternalCheck
    },
    path: '/users/internal/setup/{sessionId}/check'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: submitInternalCheck
    },
    path: '/users/internal/setup/{sessionId}/check'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: viewInternalEmail
    },
    path: '/users/internal/setup/{sessionId}/email'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: submitInternalEmail
    },
    path: '/users/internal/setup/{sessionId}/email'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: viewInternalPermissions
    },
    path: '/users/internal/setup/{sessionId}/permissions'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: submitInternalPermissions
    },
    path: '/users/internal/setup/{sessionId}/permissions'
  }
]
