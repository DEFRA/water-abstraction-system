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
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: setup
    },
    path: '/company-contacts/setup/{companyId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: setupEdit
    },
    path: '/company-contacts/setup/{companyContactId}/edit'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewAbstractionAlerts
    },
    path: '/company-contacts/setup/{sessionId}/abstraction-alerts'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitAbstractionAlerts
    },
    path: '/company-contacts/setup/{sessionId}/abstraction-alerts'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewCancel
    },
    path: '/company-contacts/setup/{sessionId}/cancel'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitCancel
    },
    path: '/company-contacts/setup/{sessionId}/cancel'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewCheck
    },
    path: '/company-contacts/setup/{sessionId}/check'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitCheck
    },
    path: '/company-contacts/setup/{sessionId}/check'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewContactEmail
    },
    path: '/company-contacts/setup/{sessionId}/contact-email'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitContactEmail
    },
    path: '/company-contacts/setup/{sessionId}/contact-email'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewContactName
    },
    path: '/company-contacts/setup/{sessionId}/contact-name'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitContactName
    },
    path: '/company-contacts/setup/{sessionId}/contact-name'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewLicences
    },
    path: '/company-contacts/setup/{sessionId}/licences'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitLicences
    },
    path: '/company-contacts/setup/{sessionId}/licences'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewRestore
    },
    path: '/company-contacts/setup/{sessionId}/restore'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitRestore
    },
    path: '/company-contacts/setup/{sessionId}/restore'
  }
]
