'use strict'

const NoticesSetupController = require('../controllers/notices-setup.controller.js')

const basePath = '/notices/setup'

const ABSTRACTION_ALERTS_PATH = 'abstraction-alerts'

const routes = [
  {
    method: 'GET',
    path: basePath,
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
    path: basePath + '/{sessionId}/download',
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
    path: basePath + `/{sessionId}/${ABSTRACTION_ALERTS_PATH}/alert-type`,
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
    path: basePath + `/{sessionId}/${ABSTRACTION_ALERTS_PATH}/alert-type`,
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
    path: basePath + `/{sessionId}/${ABSTRACTION_ALERTS_PATH}/alert-thresholds`,
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
    method: 'POST',
    path: basePath + `/{sessionId}/${ABSTRACTION_ALERTS_PATH}/alert-thresholds`,
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
    path: basePath + `/{sessionId}/${ABSTRACTION_ALERTS_PATH}/check-licence-matches`,
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
    method: 'GET',
    path: basePath + '/{sessionId}/ad-hoc-licence',
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
    path: basePath + '/{sessionId}/ad-hoc-licence',
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
    path: basePath + '/{sessionId}/cancel',
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
    path: basePath + '/{sessionId}/cancel',
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
    path: basePath + '/{sessionId}/check',
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
    path: basePath + '/{sessionId}/check',
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
    path: basePath + '/{eventId}/confirmation',
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
    path: basePath + '/{sessionId}/returns-period',
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
    method: 'GET',
    path: basePath + '/{sessionId}/remove-licences',
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
    path: basePath + '/{sessionId}/remove-licences',
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
    method: 'POST',
    path: basePath + '/{sessionId}/returns-period',
    options: {
      handler: NoticesSetupController.submitReturnsPeriod,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  }
]

module.exports = routes
