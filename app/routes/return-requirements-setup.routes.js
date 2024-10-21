'use strict'

const ReturnRequirementsSetupController = require('../controllers/return-requirements-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/abstraction-period/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.abstractionPeriod,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/abstraction-period/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.submitAbstractionPeriod,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/add',
    options: {
      handler: ReturnRequirementsSetupController.add,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }

  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/additional-submission-options',
    options: {
      handler: ReturnRequirementsSetupController.additionalSubmissionOptions,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/additional-submission-options',
    options: {
      handler: ReturnRequirementsSetupController.submitAdditionalSubmissionOptions,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/agreements-exceptions/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.agreementsExceptions,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/agreements-exceptions/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.submitAgreementsExceptions,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{licenceId}/approved',
    options: {
      handler: ReturnRequirementsSetupController.approved,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/cancel',
    options: {
      handler: ReturnRequirementsSetupController.cancel,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/cancel',
    options: {
      handler: ReturnRequirementsSetupController.submitCancel,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/check',
    options: {
      handler: ReturnRequirementsSetupController.check,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/check',
    options: {
      handler: ReturnRequirementsSetupController.submitCheck,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/delete-note',
    options: {
      handler: ReturnRequirementsSetupController.deleteNote,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/existing',
    options: {
      handler: ReturnRequirementsSetupController.existing,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/existing',
    options: {
      handler: ReturnRequirementsSetupController.submitExisting,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/frequency-collected/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.frequencyCollected,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/frequency-collected/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.submitFrequencyCollected,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/frequency-reported/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.frequencyReported,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/frequency-reported/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.submitFrequencyReported,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/method',
    options: {
      handler: ReturnRequirementsSetupController.method,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/method',
    options: {
      handler: ReturnRequirementsSetupController.submitMethod,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/no-returns-required',
    options: {
      handler: ReturnRequirementsSetupController.noReturnsRequired,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/no-returns-required',
    options: {
      handler: ReturnRequirementsSetupController.submitNoReturnsRequired,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/note',
    options: {
      handler: ReturnRequirementsSetupController.note,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/note',
    options: {
      handler: ReturnRequirementsSetupController.submitNote,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/points/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.points,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/points/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.submitPoints,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/purpose/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.purpose,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/purpose/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.submitPurpose,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/reason',
    options: {
      handler: ReturnRequirementsSetupController.reason,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/reason',
    options: {
      handler: ReturnRequirementsSetupController.submitReason,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/remove/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.remove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/remove/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.submitRemove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/returns-cycle/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.returnsCycle,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/returns-cycle/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.submitReturnsCycle,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/site-description/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.siteDescription,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/site-description/{requirementIndex}',
    options: {
      handler: ReturnRequirementsSetupController.submitSiteDescription,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/setup/{sessionId}/start-date',
    options: {
      handler: ReturnRequirementsSetupController.startDate,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }, {
    method: 'POST',
    path: '/return-requirements/setup/{sessionId}/start-date',
    options: {
      handler: ReturnRequirementsSetupController.submitStartDate,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
