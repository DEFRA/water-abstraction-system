'use strict'

const UsersSetupController = require('../controllers/users-setup.controller.js')

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
          scope: ['unlink_licences']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/setup/{sessionId}/check',
    options: {
      handler: UsersSetupController.viewCheck,
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
      handler: UsersSetupController.submitCheck,
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
      handler: UsersSetupController.viewPermissions,
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/setup/{sessionId}/permissions',
    options: {
      handler: UsersSetupController.submitPermissions,
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
      handler: UsersSetupController.viewEmail,
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
      handler: UsersSetupController.submitEmail,
      auth: {
        access: {
          scope: ['unlink_licences']
        }
      }
    }
  }
]

module.exports = routes
