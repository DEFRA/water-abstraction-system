'use strict'

const ReturnRequirementsController = require('../controllers/return-requirements.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/abstraction-period/{requirementIndex}',
    handler: ReturnRequirementsController.abstractionPeriod,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/abstraction-period/{requirementIndex}',
    handler: ReturnRequirementsController.submitAbstractionPeriod,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/add',
    handler: ReturnRequirementsController.add,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }

  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/additional-submission-options',
    handler: ReturnRequirementsController.additionalSubmissionOptions,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/additional-submission-options',
    handler: ReturnRequirementsController.submitAdditionalSubmissionOptions,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/agreements-exceptions/{requirementIndex}',
    handler: ReturnRequirementsController.agreementsExceptions,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/agreements-exceptions/{requirementIndex}',
    handler: ReturnRequirementsController.submitAgreementsExceptions,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{licenceId}/approved',
    handler: ReturnRequirementsController.approved,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/cancel',
    handler: ReturnRequirementsController.cancel,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/cancel',
    handler: ReturnRequirementsController.submitCancel,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/check',
    handler: ReturnRequirementsController.check,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/check',
    handler: ReturnRequirementsController.submitCheck,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/delete-note',
    handler: ReturnRequirementsController.deleteNote,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/existing',
    handler: ReturnRequirementsController.existing,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/existing',
    handler: ReturnRequirementsController.submitExisting,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/frequency-collected/{requirementIndex}',
    handler: ReturnRequirementsController.frequencyCollected,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/frequency-collected/{requirementIndex}',
    handler: ReturnRequirementsController.submitFrequencyCollected,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/frequency-reported/{requirementIndex}',
    handler: ReturnRequirementsController.frequencyReported,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/frequency-reported/{requirementIndex}',
    handler: ReturnRequirementsController.submitFrequencyReported,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/no-returns-required',
    handler: ReturnRequirementsController.noReturnsRequired,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/no-returns-required',
    handler: ReturnRequirementsController.submitNoReturnsRequired,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/note',
    handler: ReturnRequirementsController.note,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/note',
    handler: ReturnRequirementsController.submitNote,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/points/{requirementIndex}',
    handler: ReturnRequirementsController.points,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/points/{requirementIndex}',
    handler: ReturnRequirementsController.submitPoints,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/purpose/{requirementIndex}',
    handler: ReturnRequirementsController.purpose,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/purpose/{requirementIndex}',
    handler: ReturnRequirementsController.submitPurpose,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/reason',
    handler: ReturnRequirementsController.reason,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/reason',
    handler: ReturnRequirementsController.submitReason,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/remove/{requirementIndex}',
    handler: ReturnRequirementsController.remove,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/remove/{requirementIndex}',
    handler: ReturnRequirementsController.submitRemove,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/returns-cycle/{requirementIndex}',
    handler: ReturnRequirementsController.returnsCycle,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/returns-cycle/{requirementIndex}',
    handler: ReturnRequirementsController.submitReturnsCycle,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/setup',
    handler: ReturnRequirementsController.setup,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/setup',
    handler: ReturnRequirementsController.submitSetup,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/site-description/{requirementIndex}',
    handler: ReturnRequirementsController.siteDescription,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/site-description/{requirementIndex}',
    handler: ReturnRequirementsController.submitSiteDescription,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/start-date',
    handler: ReturnRequirementsController.startDate,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }, {
    method: 'POST',
    path: '/return-requirements/{sessionId}/start-date',
    handler: ReturnRequirementsController.submitStartDate,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{returnVersionId}/view',
    handler: ReturnRequirementsController.view,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
