import {
  abstractionPeriod,
  add,
  additionalSubmissionOptions,
  agreementsExceptions,
  approved,
  cancel,
  check,
  deleteNote,
  existing,
  frequencyCollected,
  frequencyReported,
  method,
  noReturnsRequired,
  note,
  points,
  purpose,
  reason,
  remove,
  returnsCycle,
  siteDescription,
  startDate,
  submitAbstractionPeriod,
  submitAdditionalSubmissionOptions,
  submitAgreementsExceptions,
  submitCancel,
  submitCheck,
  submitExisting,
  submitFrequencyCollected,
  submitFrequencyReported,
  submitMethod,
  submitNoReturnsRequired,
  submitNote,
  submitPoints,
  submitPurpose,
  submitReason,
  submitRemove,
  submitReturnsCycle,
  submitSiteDescription,
  submitStartDate
} from '../controllers/return-versions-setup.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: abstractionPeriod
    },
    path: '/return-versions/setup/{sessionId}/abstraction-period/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitAbstractionPeriod
    },
    path: '/return-versions/setup/{sessionId}/abstraction-period/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: add
    },
    path: '/return-versions/setup/{sessionId}/add'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: additionalSubmissionOptions
    },
    path: '/return-versions/setup/{sessionId}/additional-submission-options'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitAdditionalSubmissionOptions
    },
    path: '/return-versions/setup/{sessionId}/additional-submission-options'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: agreementsExceptions
    },
    path: '/return-versions/setup/{sessionId}/agreements-exceptions/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitAgreementsExceptions
    },
    path: '/return-versions/setup/{sessionId}/agreements-exceptions/{requirementIndex}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: approved
    },
    path: '/return-versions/setup/{licenceId}/approved'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: cancel
    },
    path: '/return-versions/setup/{sessionId}/cancel'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitCancel
    },
    path: '/return-versions/setup/{sessionId}/cancel'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: check
    },
    path: '/return-versions/setup/{sessionId}/check'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitCheck
    },
    path: '/return-versions/setup/{sessionId}/check'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: deleteNote
    },
    path: '/return-versions/setup/{sessionId}/delete-note'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: existing
    },
    path: '/return-versions/setup/{sessionId}/existing'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitExisting
    },
    path: '/return-versions/setup/{sessionId}/existing'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: frequencyCollected
    },
    path: '/return-versions/setup/{sessionId}/frequency-collected/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitFrequencyCollected
    },
    path: '/return-versions/setup/{sessionId}/frequency-collected/{requirementIndex}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: frequencyReported
    },
    path: '/return-versions/setup/{sessionId}/frequency-reported/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitFrequencyReported
    },
    path: '/return-versions/setup/{sessionId}/frequency-reported/{requirementIndex}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: method
    },
    path: '/return-versions/setup/{sessionId}/method'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitMethod
    },
    path: '/return-versions/setup/{sessionId}/method'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: noReturnsRequired
    },
    path: '/return-versions/setup/{sessionId}/no-returns-required'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitNoReturnsRequired
    },
    path: '/return-versions/setup/{sessionId}/no-returns-required'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: note
    },
    path: '/return-versions/setup/{sessionId}/note'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitNote
    },
    path: '/return-versions/setup/{sessionId}/note'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: points
    },
    path: '/return-versions/setup/{sessionId}/points/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitPoints
    },
    path: '/return-versions/setup/{sessionId}/points/{requirementIndex}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: purpose
    },
    path: '/return-versions/setup/{sessionId}/purpose/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitPurpose
    },
    path: '/return-versions/setup/{sessionId}/purpose/{requirementIndex}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: reason
    },
    path: '/return-versions/setup/{sessionId}/reason'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitReason
    },
    path: '/return-versions/setup/{sessionId}/reason'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: remove
    },
    path: '/return-versions/setup/{sessionId}/remove/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitRemove
    },
    path: '/return-versions/setup/{sessionId}/remove/{requirementIndex}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: returnsCycle
    },
    path: '/return-versions/setup/{sessionId}/returns-cycle/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitReturnsCycle
    },
    path: '/return-versions/setup/{sessionId}/returns-cycle/{requirementIndex}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: siteDescription
    },
    path: '/return-versions/setup/{sessionId}/site-description/{requirementIndex}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitSiteDescription
    },
    path: '/return-versions/setup/{sessionId}/site-description/{requirementIndex}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: startDate
    },
    path: '/return-versions/setup/{sessionId}/start-date'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitStartDate
    },
    path: '/return-versions/setup/{sessionId}/start-date'
  }
]
