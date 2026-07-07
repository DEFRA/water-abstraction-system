import UsersSetupController from '../controllers/users-setup.controller.js'

const routes = [
  {
    method: 'POST',
    path: '/users/external/{id}/setup',
    options: {
      handler: UsersSetupController.setupExternal,
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
      handler: UsersSetupController.viewExternalCancel,
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
      handler: UsersSetupController.submitExternalCancel,
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
      handler: UsersSetupController.viewExternalCheck,
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
      handler: UsersSetupController.submitExternalCheck,
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
      handler: UsersSetupController.viewExternalLicences,
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
      handler: UsersSetupController.submitExternalLicences,
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
      handler: UsersSetupController.setupInternal,
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
      handler: UsersSetupController.setupInternalEdit,
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
      handler: UsersSetupController.viewInternalAccess,
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
      handler: UsersSetupController.submitInternalAccess,
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
      handler: UsersSetupController.viewInternalCancel,
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
      handler: UsersSetupController.submitInternalCancel,
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
      handler: UsersSetupController.viewInternalCheck,
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
      handler: UsersSetupController.submitInternalCheck,
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
      handler: UsersSetupController.viewInternalEmail,
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
      handler: UsersSetupController.submitInternalEmail,
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
      handler: UsersSetupController.viewInternalPermissions,
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
      handler: UsersSetupController.submitInternalPermissions,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  }
]

export default routes
