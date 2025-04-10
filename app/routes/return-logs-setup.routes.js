'use strict'

const ReturnLogsSetupController = require('../controllers/return-logs-setup.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/return-logs/setup',
    options: {
      handler: ReturnLogsSetupController.submitSetup,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/confirmed',
    options: {
      handler: ReturnLogsSetupController.confirmed,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/confirmed',
    options: {
      handler: ReturnLogsSetupController.submitConfirmed,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/guidance',
    options: {
      handler: ReturnLogsSetupController.guidance,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/cancel',
    options: {
      handler: ReturnLogsSetupController.cancel,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/cancel',
    options: {
      handler: ReturnLogsSetupController.submitCancel,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/check',
    options: {
      handler: ReturnLogsSetupController.check,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/check',
    options: {
      handler: ReturnLogsSetupController.submitCheck,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/delete-note',
    options: {
      handler: ReturnLogsSetupController.deleteNote,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/meter-details',
    options: {
      handler: ReturnLogsSetupController.meterDetails,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/meter-details',
    options: {
      handler: ReturnLogsSetupController.submitMeterDetails,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/meter-provided',
    options: {
      handler: ReturnLogsSetupController.meterProvided,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/meter-provided',
    options: {
      handler: ReturnLogsSetupController.submitMeterProvided,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/note',
    options: {
      handler: ReturnLogsSetupController.note,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/note',
    options: {
      handler: ReturnLogsSetupController.submitNote,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/period-used',
    options: {
      handler: ReturnLogsSetupController.periodUsed,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/period-used',
    options: {
      handler: ReturnLogsSetupController.submitPeriodUsed,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/received',
    options: {
      handler: ReturnLogsSetupController.received,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/received',
    options: {
      handler: ReturnLogsSetupController.submitReceived,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/reported',
    options: {
      handler: ReturnLogsSetupController.reported,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/reported',
    options: {
      handler: ReturnLogsSetupController.submitReported,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/single-volume',
    options: {
      handler: ReturnLogsSetupController.singleVolume,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/single-volume',
    options: {
      handler: ReturnLogsSetupController.submitSingleVolume,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/start-reading',
    options: {
      handler: ReturnLogsSetupController.startReading,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/start-reading',
    options: {
      handler: ReturnLogsSetupController.submitStartReading,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/submission',
    options: {
      handler: ReturnLogsSetupController.submission,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/submission',
    options: {
      handler: ReturnLogsSetupController.submitSubmission,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/units',
    options: {
      handler: ReturnLogsSetupController.units,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/units',
    options: {
      handler: ReturnLogsSetupController.submitUnits,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/multiple-entries',
    options: {
      handler: ReturnLogsSetupController.multipleEntries,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/multiple-entries',
    options: {
      handler: ReturnLogsSetupController.submitMultipleEntries,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
