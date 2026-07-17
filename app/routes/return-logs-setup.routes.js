import {
  cancel,
  check,
  confirmed,
  deleteNote,
  guidance,
  meterDetails,
  meterProvided,
  multipleEntries,
  note,
  periodUsed,
  readings,
  received,
  reported,
  singleVolume,
  startReading,
  submission,
  submitCancel,
  submitCheck,
  submitConfirmed,
  submitMeterDetails,
  submitMeterProvided,
  submitMultipleEntries,
  submitNote,
  submitPeriodUsed,
  submitReadings,
  submitReceived,
  submitReported,
  submitSetup,
  submitSingleVolume,
  submitStartReading,
  submitSubmission,
  submitUnits,
  submitVolumes,
  units,
  volumes
} from '../controllers/return-logs-setup.controller.js'

export default [
  {
    method: 'POST',
    path: '/return-logs/setup',
    options: {
      handler: submitSetup,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/confirmed/{returnLogId}',
    options: {
      handler: confirmed,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/confirmed/{returnLogId}',
    options: {
      handler: submitConfirmed,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/guidance',
    options: {
      handler: guidance,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/cancel',
    options: {
      handler: cancel,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/cancel',
    options: {
      handler: submitCancel,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/check',
    options: {
      handler: check,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/check',
    options: {
      handler: submitCheck,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/delete-note',
    options: {
      handler: deleteNote,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/meter-details',
    options: {
      handler: meterDetails,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/meter-details',
    options: {
      handler: submitMeterDetails,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/meter-provided',
    options: {
      handler: meterProvided,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/meter-provided',
    options: {
      handler: submitMeterProvided,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/note',
    options: {
      handler: note,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/note',
    options: {
      handler: submitNote,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/period-used',
    options: {
      handler: periodUsed,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/period-used',
    options: {
      handler: submitPeriodUsed,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/readings/{yearMonth}',
    options: {
      handler: readings,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/readings/{yearMonth}',
    options: {
      handler: submitReadings,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/volumes/{yearMonth}',
    options: {
      handler: volumes,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/volumes/{yearMonth}',
    options: {
      handler: submitVolumes,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/received',
    options: {
      handler: received,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/received',
    options: {
      handler: submitReceived,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/reported',
    options: {
      handler: reported,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/reported',
    options: {
      handler: submitReported,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/single-volume',
    options: {
      handler: singleVolume,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/single-volume',
    options: {
      handler: submitSingleVolume,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/start-reading',
    options: {
      handler: startReading,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/start-reading',
    options: {
      handler: submitStartReading,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/submission',
    options: {
      handler: submission,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/submission',
    options: {
      handler: submitSubmission,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/units',
    options: {
      handler: units,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/units',
    options: {
      handler: submitUnits,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/multiple-entries',
    options: {
      handler: multipleEntries,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/multiple-entries',
    options: {
      handler: submitMultipleEntries,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  }
]
