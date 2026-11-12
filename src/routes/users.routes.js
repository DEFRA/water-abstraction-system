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

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: index
    },
    path: '/users'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: submitIndex
    },
    path: '/users'
  },
  {
    method: 'GET',
    options: {
      handler: viewExternalCommunications
    },
    path: '/users/external/{id}/communications'
  },
  {
    method: 'GET',
    options: {
      handler: viewExternalDetails
    },
    path: '/users/external/{id}/details'
  },
  {
    method: 'GET',
    options: {
      handler: viewExternalLicences
    },
    path: '/users/external/{id}/licences'
  },
  {
    method: 'GET',
    options: {
      handler: viewExternalVerifications
    },
    path: '/users/external/{id}/verifications'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: viewInternalCommunications
    },
    path: '/users/internal/{id}/communications'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: viewInternalDetails
    },
    path: '/users/internal/{id}/details'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_accounts']
        }
      },
      handler: submitInternalDetails
    },
    path: '/users/internal/{id}/details'
  },
  {
    method: 'GET',
    options: {
      handler: viewNotification
    },
    path: '/users/{type}/{id}/notifications/{notificationId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications', 'renewal_notifications']
        }
      },
      handler: viewProfileDetails
    },
    path: '/users/me/profile-details'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications', 'renewal_notifications']
        }
      },
      handler: submitProfileDetails
    },
    path: '/users/me/profile-details'
  }
]
