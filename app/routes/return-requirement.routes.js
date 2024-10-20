'use strict'

const ReturnRequirementsController = require('../controllers/return-requirements.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/abstraction-period/{requirementIndex}',
    options: {
      handler: ReturnRequirementsController.abstractionPeriod,
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
    options: {
      handler: ReturnRequirementsController.submitAbstractionPeriod,
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
    options: {
      handler: ReturnRequirementsController.add,
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
    options: {
      handler: ReturnRequirementsController.additionalSubmissionOptions,
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
    options: {
      handler: ReturnRequirementsController.submitAdditionalSubmissionOptions,
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
    options: {
      handler: ReturnRequirementsController.agreementsExceptions,
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
    options: {
      handler: ReturnRequirementsController.submitAgreementsExceptions,
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
    options: {
      handler: ReturnRequirementsController.approved,
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
    options: {
      handler: ReturnRequirementsController.cancel,
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
    options: {
      handler: ReturnRequirementsController.submitCancel,
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
    options: {
      handler: ReturnRequirementsController.check,
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
    options: {
      handler: ReturnRequirementsController.submitCheck,
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
    options: {
      handler: ReturnRequirementsController.deleteNote,
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
    options: {
      handler: ReturnRequirementsController.existing,
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
    options: {
      handler: ReturnRequirementsController.submitExisting,
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
    options: {
      handler: ReturnRequirementsController.frequencyCollected,
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
    options: {
      handler: ReturnRequirementsController.submitFrequencyCollected,
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
    options: {
      handler: ReturnRequirementsController.frequencyReported,
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
    options: {
      handler: ReturnRequirementsController.submitFrequencyReported,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/method',
    options: {
      handler: ReturnRequirementsController.method,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/method',
    options: {
      handler: ReturnRequirementsController.submitMethod,
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
    options: {
      handler: ReturnRequirementsController.noReturnsRequired,
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
    options: {
      handler: ReturnRequirementsController.submitNoReturnsRequired,
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
    options: {
      handler: ReturnRequirementsController.note,
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
    options: {
      handler: ReturnRequirementsController.submitNote,
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
    options: {
      handler: ReturnRequirementsController.points,
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
    options: {
      handler: ReturnRequirementsController.submitPoints,
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
    options: {
      handler: ReturnRequirementsController.purpose,
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
    options: {
      handler: ReturnRequirementsController.submitPurpose,
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
    options: {
      handler: ReturnRequirementsController.reason,
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
    options: {
      handler: ReturnRequirementsController.submitReason,
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
    options: {
      handler: ReturnRequirementsController.remove,
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
    options: {
      handler: ReturnRequirementsController.submitRemove,
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
    options: {
      handler: ReturnRequirementsController.returnsCycle,
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
    options: {
      handler: ReturnRequirementsController.submitReturnsCycle,
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
    options: {
      handler: ReturnRequirementsController.siteDescription,
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
    options: {
      handler: ReturnRequirementsController.submitSiteDescription,
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
    options: {
      handler: ReturnRequirementsController.startDate,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }, {
    method: 'POST',
    path: '/return-requirements/{sessionId}/start-date',
    options: {
      handler: ReturnRequirementsController.submitStartDate,
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
    options: {
      handler: ReturnRequirementsController.view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
