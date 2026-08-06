import {
  setup,
  setupEdit,
  submitAbstractionAlerts,
  submitCancel,
  submitCheck,
  submitContactEmail,
  submitContactName,
  submitLicences,
  submitRestore,
  viewAbstractionAlerts,
  viewCancel,
  viewCheck,
  viewContactEmail,
  viewContactName,
  viewLicences,
  viewRestore
} from '../controllers/company-contacts-setup.controller.js'

export default [
  {
    method: 'GET',
    path: '/company-contacts/setup/{companyId}',
    options: {
      handler: setup,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{companyContactId}/edit',
    options: {
      handler: setupEdit,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{sessionId}/abstraction-alerts',
    options: {
      handler: viewAbstractionAlerts,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/setup/{sessionId}/abstraction-alerts',
    options: {
      handler: submitAbstractionAlerts,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{sessionId}/cancel',
    options: {
      handler: viewCancel,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/setup/{sessionId}/cancel',
    options: {
      handler: submitCancel,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{sessionId}/check',
    options: {
      handler: viewCheck,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/setup/{sessionId}/check',
    options: {
      handler: submitCheck,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{sessionId}/contact-email',
    options: {
      handler: viewContactEmail,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/setup/{sessionId}/contact-email',
    options: {
      handler: submitContactEmail,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{sessionId}/contact-name',
    options: {
      handler: viewContactName,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/setup/{sessionId}/contact-name',
    options: {
      handler: submitContactName,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{sessionId}/licences',
    options: {
      handler: viewLicences,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/setup/{sessionId}/licences',
    options: {
      handler: submitLicences,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{sessionId}/restore',
    options: {
      handler: viewRestore,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/setup/{sessionId}/restore',
    options: {
      handler: submitRestore,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  }
]
