import {
  index,
  submitIndex,
  submitInternalDetails,
  submitProfileDetails,
  viewExternalCommunications,
  viewExternalDetails,
  viewExternalLicences,
  viewExternalVerifications,
  viewInternalCommunications,
  viewInternalDetails,
  viewNotification,
  viewProfileDetails
} from '../controllers/users.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/users',
    options: {
      handler: index,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users',
    options: {
      handler: submitIndex,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/external/{id}/communications',
    options: {
      handler: viewExternalCommunications
    }
  },
  {
    method: 'GET',
    path: '/users/external/{id}/details',
    options: {
      handler: viewExternalDetails
    }
  },
  {
    method: 'GET',
    path: '/users/external/{id}/licences',
    options: {
      handler: viewExternalLicences
    }
  },
  {
    method: 'GET',
    path: '/users/external/{id}/verifications',
    options: {
      handler: viewExternalVerifications
    }
  },
  {
    method: 'GET',
    path: '/users/internal/{id}/communications',
    options: {
      handler: viewInternalCommunications,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/internal/{id}/details',
    options: {
      handler: viewInternalDetails,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/internal/{id}/details',
    options: {
      handler: submitInternalDetails,
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/{type}/{id}/notifications/{notificationId}',
    options: {
      handler: viewNotification
    }
  },
  {
    method: 'GET',
    path: '/users/me/profile-details',
    options: {
      handler: viewProfileDetails,
      auth: {
        access: {
          scope: ['hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/me/profile-details',
    options: {
      handler: submitProfileDetails,
      auth: {
        access: {
          scope: ['hof_notifications', 'renewal_notifications']
        }
      }
    }
  }
]

export default routes
