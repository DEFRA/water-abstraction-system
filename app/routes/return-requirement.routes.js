'use strict'

const ReturnRequirementsController = require('../controllers/return-requirements.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/abstraction-period',
    handler: ReturnRequirementsController.abstractionPeriod,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns abstraction period page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/abstraction-period',
    handler: ReturnRequirementsController.saveAbstractionPeriod,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save abstraction period'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/add-note',
    handler: ReturnRequirementsController.addNote,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns add a note page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/add-note',
    handler: ReturnRequirementsController.saveAddNote,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save note'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/agreements-exceptions',
    handler: ReturnRequirementsController.agreementsExceptions,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Select agreements and exceptions'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/agreements-exceptions',
    handler: ReturnRequirementsController.saveAgreementsExceptions,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save agreements and exceptions'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/approved',
    handler: ReturnRequirementsController.approved,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns requirements approved'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/check-your-answers',
    handler: ReturnRequirementsController.checkYourAnswers,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns check your answers page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/check-your-answers',
    handler: ReturnRequirementsController.checkYourAnswers,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns check your answers page'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/frequency-collected',
    handler: ReturnRequirementsController.frequencyCollected,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns Select how often readings or volumes are collected page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/frequency-collected',
    handler: ReturnRequirementsController.saveFrequencyCollected,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save frequency collected'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/frequency-reported',
    handler: ReturnRequirementsController.frequencyReported,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns Select how often collected readings or volumes are reported page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/frequency-reported',
    handler: ReturnRequirementsController.saveFrequencyReported,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save frequency reported'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/no-returns-check-your-answers',
    handler: ReturnRequirementsController.noReturnsCheckYourAnswers,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'No return check your answers page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/no-returns-check-your-answers',
    handler: ReturnRequirementsController.saveNoReturnsCheckYourAnswers,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'No return check your answers page'
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
      },
      description: 'Show no returns required page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/no-returns-required',
    handler: ReturnRequirementsController.saveNoReturnsRequired,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save no returns required option'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/points',
    handler: ReturnRequirementsController.points,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns select points page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/points',
    handler: ReturnRequirementsController.savePoints,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save points'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/purpose',
    handler: ReturnRequirementsController.purpose,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Select purpose for returns requirement page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/purpose',
    handler: ReturnRequirementsController.savePurpose,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save purpose for returns requirement'
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
      },
      description: 'Reason page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/reason',
    handler: ReturnRequirementsController.saveReason,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save reason for the return requirement'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/returns-cycle',
    handler: ReturnRequirementsController.returnsCycle,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns Select the returns cycle page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/returns-cycle',
    handler: ReturnRequirementsController.saveReturnsCycle,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save the returns cycle'
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
      },
      description: 'Returns required - create How do you want to set up the requirements'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/setup',
    handler: ReturnRequirementsController.saveSetup,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns required - create How do you want to set up the requirements'
    }
  },
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/site-description',
    handler: ReturnRequirementsController.siteDescription,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns add a site description page'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/site-description',
    handler: ReturnRequirementsController.saveSiteDescription,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save site description'
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
      },
      description: 'Select the start date of the return'
    }
  }, {
    method: 'POST',
    path: '/return-requirements/{sessionId}/start-date',
    handler: ReturnRequirementsController.saveStartDate,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save the start date of the return'
    }
  }
]

module.exports = routes
