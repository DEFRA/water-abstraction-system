'use strict'

const ReturnVersionsSetupController = require('../controllers/return-versions-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-versions/setup/{sessionId}/abstraction-period/{requirementIndex}',
    options: {
      handler: ReturnVersionsSetupController.abstractionPeriod,
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
      handler: ReturnVersionsSetupController.submitAbstractionPeriod,
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
      handler: ReturnVersionsSetupController.add,
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
      handler: ReturnVersionsSetupController.additionalSubmissionOptions,
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
      handler: ReturnVersionsSetupController.submitAdditionalSubmissionOptions,
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
      handler: ReturnVersionsSetupController.agreementsExceptions,
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
      handler: ReturnVersionsSetupController.submitAgreementsExceptions,
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
      handler: ReturnVersionsSetupController.approved,
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
      handler: ReturnVersionsSetupController.cancel,
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
      handler: ReturnVersionsSetupController.submitCancel,
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
      handler: ReturnVersionsSetupController.check,
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
      handler: ReturnVersionsSetupController.submitCheck,
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
      handler: ReturnVersionsSetupController.deleteNote,
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
      handler: ReturnVersionsSetupController.existing,
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
      handler: ReturnVersionsSetupController.submitExisting,
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
      handler: ReturnVersionsSetupController.frequencyCollected,
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
      handler: ReturnVersionsSetupController.submitFrequencyCollected,
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
      handler: ReturnVersionsSetupController.frequencyReported,
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
      handler: ReturnVersionsSetupController.submitFrequencyReported,
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
      handler: ReturnVersionsSetupController.method,
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
      handler: ReturnVersionsSetupController.submitMethod,
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
      handler: ReturnVersionsSetupController.noReturnsRequired,
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
      handler: ReturnVersionsSetupController.submitNoReturnsRequired,
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
      handler: ReturnVersionsSetupController.note,
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
      handler: ReturnVersionsSetupController.submitNote,
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
      handler: ReturnVersionsSetupController.points,
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
      handler: ReturnVersionsSetupController.submitPoints,
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
      handler: ReturnVersionsSetupController.purpose,
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
      handler: ReturnVersionsSetupController.submitPurpose,
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
      handler: ReturnVersionsSetupController.reason,
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
      handler: ReturnVersionsSetupController.submitReason,
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
      handler: ReturnVersionsSetupController.remove,
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
      handler: ReturnVersionsSetupController.submitRemove,
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
      handler: ReturnVersionsSetupController.returnsCycle,
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
      handler: ReturnVersionsSetupController.submitReturnsCycle,
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
      handler: ReturnVersionsSetupController.siteDescription,
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
      handler: ReturnVersionsSetupController.submitSiteDescription,
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
      handler: ReturnVersionsSetupController.startDate,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }, {
    method: 'POST',
    path: '/return-versions/setup/{sessionId}/start-date',
    options: {
      handler: ReturnVersionsSetupController.submitStartDate,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
