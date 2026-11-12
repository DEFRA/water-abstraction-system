import {
  clean,
  customerFiles,
  exportDb,
  licenceUpdates,
  notificationStatus,
  renewalInvitations,
  renewalNotice,
  returnLogs,
  timeLimited
} from '../controllers/jobs.controller.js'

export default [
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: clean,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/clean'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: customerFiles,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/customer-files/{days}'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: exportDb,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/export'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: licenceUpdates,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/licence-updates'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: notificationStatus,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/notification-status'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: notificationStatus,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/notifications-status-updates'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: renewalInvitations,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/renewal-invitations/{days}'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: renewalNotice,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/renewal-notice/{requestedNoticeType}'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: returnLogs,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/return-logs/{cycle}'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: timeLimited,
      plugins: {
        crumb: false
      }
    },
    path: '/jobs/time-limited'
  }
]
