'use strict'

const NotificationsSetupController = require('../controllers/notifications-setup.controller.js')

const basePath = '/notifications/setup'

const routes = [
  {
    method: 'GET',
    path: basePath,
    options: {
      handler: NotificationsSetupController.setup,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: basePath + '/{sessionId}/download',
    options: {
      handler: NotificationsSetupController.downloadRecipients,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: basePath + '/{sessionId}/ad-hoc-licence',
    options: {
      handler: NotificationsSetupController.viewLicence,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: basePath + '/{sessionId}/ad-hoc-licence',
    options: {
      handler: NotificationsSetupController.submitLicence,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: basePath + '/{sessionId}/returns-period',
    options: {
      handler: NotificationsSetupController.viewReturnsPeriod,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: basePath + '/{sessionId}/remove-licences',
    options: {
      handler: NotificationsSetupController.viewRemoveLicences,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: basePath + '/{sessionId}/remove-licences',
    options: {
      handler: NotificationsSetupController.submitRemoveLicences,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: basePath + '/{sessionId}/review',
    options: {
      handler: NotificationsSetupController.viewReview,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: basePath + '/{sessionId}/returns-period',
    options: {
      handler: NotificationsSetupController.submitReturnsPeriod,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  }
]

module.exports = routes
