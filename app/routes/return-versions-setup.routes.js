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

const routes = [
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/abstraction-period/{requirementIndex}',
    options: {
      handler: abstractionPeriod,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/abstraction-period/{requirementIndex}',
    options: {
      handler: submitAbstractionPeriod,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/add',
    options: {
      handler: add,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/additional-submission-options',
    options: {
      handler: additionalSubmissionOptions,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/additional-submission-options',
    options: {
      handler: submitAdditionalSubmissionOptions,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/agreements-exceptions/{requirementIndex}',
    options: {
      handler: agreementsExceptions,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/agreements-exceptions/{requirementIndex}',
    options: {
      handler: submitAgreementsExceptions,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{licenceId}/approved',
    options: {
      handler: approved,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/cancel',
    options: {
      handler: cancel,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/cancel',
    options: {
      handler: submitCancel,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/check',
    options: {
      handler: check,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/check',
    options: {
      handler: submitCheck,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/delete-note',
    options: {
      handler: deleteNote,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/existing',
    options: {
      handler: existing,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/existing',
    options: {
      handler: submitExisting,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/frequency-collected/{requirementIndex}',
    options: {
      handler: frequencyCollected,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/frequency-collected/{requirementIndex}',
    options: {
      handler: submitFrequencyCollected,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/frequency-reported/{requirementIndex}',
    options: {
      handler: frequencyReported,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/frequency-reported/{requirementIndex}',
    options: {
      handler: submitFrequencyReported,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/method',
    options: {
      handler: method,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/method',
    options: {
      handler: submitMethod,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/no-returns-required',
    options: {
      handler: noReturnsRequired,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/no-returns-required',
    options: {
      handler: submitNoReturnsRequired,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/note',
    options: {
      handler: note,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/note',
    options: {
      handler: submitNote,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/points/{requirementIndex}',
    options: {
      handler: points,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/points/{requirementIndex}',
    options: {
      handler: submitPoints,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/purpose/{requirementIndex}',
    options: {
      handler: purpose,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/purpose/{requirementIndex}',
    options: {
      handler: submitPurpose,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/reason',
    options: {
      handler: reason,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/reason',
    options: {
      handler: submitReason,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/remove/{requirementIndex}',
    options: {
      handler: remove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/remove/{requirementIndex}',
    options: {
      handler: submitRemove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/returns-cycle/{requirementIndex}',
    options: {
      handler: returnsCycle,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/returns-cycle/{requirementIndex}',
    options: {
      handler: submitReturnsCycle,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/site-description/{requirementIndex}',
    options: {
      handler: siteDescription,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/site-description/{requirementIndex}',
    options: {
      handler: submitSiteDescription,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/start-date',
    options: {
      handler: startDate,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/start-date',
    options: {
      handler: submitStartDate,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

export default routes
