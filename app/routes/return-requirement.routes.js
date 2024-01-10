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
      description: 'Enter the abstraction period for the return requirement'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/abstraction-period',
    handler: ReturnRequirementsController.submitAbstractionPeriod,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the abstraction period for the return requirement'
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
      description: 'Add a note'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/add-note',
    handler: ReturnRequirementsController.submitAddNote,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit a note'
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
      description: 'Select agreements and exceptions for the return requirement'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/agreements-exceptions',
    handler: ReturnRequirementsController.submitAgreementsExceptions,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit agreements and exceptions for the return requirement'
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
      description: 'Check your answers'
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
      description: 'Submit check your answers'
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
      description: 'Select how often readings or volumes are collected'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/frequency-collected',
    handler: ReturnRequirementsController.submitFrequencyCollected,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit how often readings or volumes are collected'
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
      description: 'Select how often collected readings or volumes are reported'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/frequency-reported',
    handler: ReturnRequirementsController.submitFrequencyReported,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit how often collected readings or volumes are reported'
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
      description: 'Why are no returns required?'
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
      },
      description: 'Submit why are no returns required?'
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
      description: 'Select the points for the return requirement'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/points',
    handler: ReturnRequirementsController.submitPoints,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the points for the return requirement'
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
      description: 'Select the purpose for the return requirement'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/purpose',
    handler: ReturnRequirementsController.submitPurpose,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the purpose for the return requirement'
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
      description: 'Select the reason for the return requirement'
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
      },
      description: 'Submit the reason for the return requirement'
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
      description: 'Select the returns cycle for the return requirement'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/returns-cycle',
    handler: ReturnRequirementsController.submitReturnsCycle,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit the returns cycle for the return requirement'
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
      description: 'How do you want to set up the return requirement?'
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
      },
      description: 'Submit how do you want to set up the return requirement?'
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
      description: 'Enter a site description for the return requirement'
    }
  },
  {
    method: 'POST',
    path: '/return-requirements/{sessionId}/site-description',
    handler: ReturnRequirementsController.submitSiteDescription,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Submit a site description for the return requirement'
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
      description: 'Select the start date for the return requirement'
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
      },
      description: 'Submit the start date for the return requirement'
    }
  }
]

module.exports = routes
