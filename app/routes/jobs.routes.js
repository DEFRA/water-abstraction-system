import {
  clean,
  customerFiles,
  exportDb,
  licenceUpdates,
  notificationStatus,
  renewalInvitations,
  returnLogs,
  timeLimited
} from '../controllers/jobs.controller.js'

const routes = [
  {
    method: 'POST',
    path: '/jobs/clean',
    options: {
      handler: clean,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/customer-files/{days}',
    options: {
      handler: customerFiles,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/export',
    options: {
      handler: exportDb,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/licence-updates',
    options: {
      handler: licenceUpdates,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/notification-status',
    options: {
      handler: notificationStatus,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/notifications-status-updates',
    options: {
      handler: notificationStatus,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/renewal-invitations/{days}',
    options: {
      handler: renewalInvitations,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/return-logs/{cycle}',
    options: {
      handler: returnLogs,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/time-limited',
    options: {
      handler: timeLimited,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  }
]

export default routes
