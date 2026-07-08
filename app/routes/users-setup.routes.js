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

const routes = [
  {
    method: 'POST',
    path: '/users/external/{id}/setup',
    options: {
      handler: setupExternal,
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/external/setup/{sessionId}/cancel',
    options: {
      handler: viewExternalCancel,
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/external/setup/{sessionId}/cancel',
    options: {
      handler: submitExternalCancel,
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/external/setup/{sessionId}/check',
    options: {
      handler: viewExternalCheck,
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/external/setup/{sessionId}/check',
    options: {
      handler: submitExternalCheck,
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/external/setup/{sessionId}/licences',
    options: {
      handler: viewExternalLicences,
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/external/setup/{sessionId}/licences',
    options: {
      handler: submitExternalLicences,
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup',
    options: {
      handler: setupInternal,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{id}/edit',
    options: {
      handler: setupInternalEdit,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/access',
    options: {
      handler: viewInternalAccess,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/access',
    options: {
      handler: submitInternalAccess,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/cancel',
    options: {
      handler: viewInternalCancel,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/cancel',
    options: {
      handler: submitInternalCancel,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/check',
    options: {
      handler: viewInternalCheck,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/check',
    options: {
      handler: submitInternalCheck,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/email',
    options: {
      handler: viewInternalEmail,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/email',
    options: {
      handler: submitInternalEmail,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/permissions',
    options: {
      handler: viewInternalPermissions,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/permissions',
    options: {
      handler: submitInternalPermissions,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  }
]

export default routes
