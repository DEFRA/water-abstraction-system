'use strict'

const NoticesSetupController = require('../controllers/notices-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/notices/setup/{journey}',
    options: {
      handler: NoticesSetupController.setup,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/download',
    options: {
      handler: NoticesSetupController.downloadRecipients,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-email-address',
    options: {
      handler: NoticesSetupController.viewAlertEmailAddress,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-email-address',
    options: {
      handler: NoticesSetupController.submitAlertEmailAddress,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-type',
    options: {
      handler: NoticesSetupController.viewAlertType,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-type',
    options: {
      handler: NoticesSetupController.submitAlertType,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds',
    options: {
      handler: NoticesSetupController.viewAlertThresholds,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/cancel',
    options: {
      handler: NoticesSetupController.viewCancelAlerts,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/cancel',
    options: {
      handler: NoticesSetupController.submitCancelAlerts,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds',
    options: {
      handler: NoticesSetupController.submitAlertThresholds,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches',
    options: {
      handler: NoticesSetupController.viewCheckLicenceMatches,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches',
    options: {
      handler: NoticesSetupController.submitCheckLicenceMatches,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}',
    options: {
      handler: NoticesSetupController.viewRemoveThreshold,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/licence',
    options: {
      handler: NoticesSetupController.viewLicence,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/licence',
    options: {
      handler: NoticesSetupController.submitLicence,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/cancel',
    options: {
      handler: NoticesSetupController.viewCancel,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/cancel',
    options: {
      handler: NoticesSetupController.submitCancel,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/check',
    options: {
      handler: NoticesSetupController.viewCheck,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/check',
    options: {
      handler: NoticesSetupController.submitCheck,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/check-notice-type',
    options: {
      handler: NoticesSetupController.viewCheckNoticeType,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{eventId}/confirmation',
    options: {
      handler: NoticesSetupController.viewConfirmation,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/notice-type',
    options: {
      handler: NoticesSetupController.viewNoticeType,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/notice-type',
    options: {
      handler: NoticesSetupController.submitNoticeType,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/preview/{contactHashId}',
    options: {
      handler: NoticesSetupController.preview,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/alert/{licenceMonitoringStationId}',
    options: {
      handler: NoticesSetupController.preview,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/check-alert',
    options: {
      handler: NoticesSetupController.checkAlert,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/remove-licences',
    options: {
      handler: NoticesSetupController.viewRemoveLicences,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/remove-licences',
    options: {
      handler: NoticesSetupController.submitRemoveLicences,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/returns-period',
    options: {
      handler: NoticesSetupController.viewReturnsPeriod,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/returns-period',
    options: {
      handler: NoticesSetupController.submitReturnsPeriod,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/return-forms',
    options: {
      handler: NoticesSetupController.viewReturnForms,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/return-forms',
    options: {
      handler: NoticesSetupController.submitReturnForms,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  }
]

module.exports = routes
