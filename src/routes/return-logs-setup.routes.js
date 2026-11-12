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
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitSetup
    },
    path: '/return-logs/setup'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: confirmed
    },
    path: '/return-logs/setup/confirmed/{returnLogId}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitConfirmed
    },
    path: '/return-logs/setup/confirmed/{returnLogId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: guidance
    },
    path: '/return-logs/setup/guidance'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: cancel
    },
    path: '/return-logs/setup/{sessionId}/cancel'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitCancel
    },
    path: '/return-logs/setup/{sessionId}/cancel'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: check
    },
    path: '/return-logs/setup/{sessionId}/check'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitCheck
    },
    path: '/return-logs/setup/{sessionId}/check'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: deleteNote
    },
    path: '/return-logs/setup/{sessionId}/delete-note'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: meterDetails
    },
    path: '/return-logs/setup/{sessionId}/meter-details'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitMeterDetails
    },
    path: '/return-logs/setup/{sessionId}/meter-details'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: meterProvided
    },
    path: '/return-logs/setup/{sessionId}/meter-provided'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitMeterProvided
    },
    path: '/return-logs/setup/{sessionId}/meter-provided'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: note
    },
    path: '/return-logs/setup/{sessionId}/note'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitNote
    },
    path: '/return-logs/setup/{sessionId}/note'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: periodUsed
    },
    path: '/return-logs/setup/{sessionId}/period-used'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitPeriodUsed
    },
    path: '/return-logs/setup/{sessionId}/period-used'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: readings
    },
    path: '/return-logs/setup/{sessionId}/readings/{yearMonth}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitReadings
    },
    path: '/return-logs/setup/{sessionId}/readings/{yearMonth}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: volumes
    },
    path: '/return-logs/setup/{sessionId}/volumes/{yearMonth}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitVolumes
    },
    path: '/return-logs/setup/{sessionId}/volumes/{yearMonth}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: received
    },
    path: '/return-logs/setup/{sessionId}/received'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitReceived
    },
    path: '/return-logs/setup/{sessionId}/received'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: reported
    },
    path: '/return-logs/setup/{sessionId}/reported'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitReported
    },
    path: '/return-logs/setup/{sessionId}/reported'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: singleVolume
    },
    path: '/return-logs/setup/{sessionId}/single-volume'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitSingleVolume
    },
    path: '/return-logs/setup/{sessionId}/single-volume'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: startReading
    },
    path: '/return-logs/setup/{sessionId}/start-reading'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitStartReading
    },
    path: '/return-logs/setup/{sessionId}/start-reading'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submission
    },
    path: '/return-logs/setup/{sessionId}/submission'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitSubmission
    },
    path: '/return-logs/setup/{sessionId}/submission'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: units
    },
    path: '/return-logs/setup/{sessionId}/units'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitUnits
    },
    path: '/return-logs/setup/{sessionId}/units'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: multipleEntries
    },
    path: '/return-logs/setup/{sessionId}/multiple-entries'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['returns']
        }
      },
      handler: submitMultipleEntries
    },
    path: '/return-logs/setup/{sessionId}/multiple-entries'
  }
]
