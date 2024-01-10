'use strict'

const ReturnRequirementsController = require('../controllers/return-requirements.controller.js')

const routes = [
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
  }, {
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
  }, {
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
  }, {
    method: 'GET',
    path: '/return-requirements/{sessionId}/how-do-you-want',
    handler: ReturnRequirementsController.howDoYouWant,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns required - create How do you want to set up the requirements'
    }
  }, {
    method: 'POST',
    path: '/return-requirements/{sessionId}/how-do-you-want',
    handler: ReturnRequirementsController.saveHowDoYouWant,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns required - create How do you want to set up the requirements'
    }
  }, {
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
  }, {
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
  }, {
    method: 'GET',
    path: '/return-requirements/requirements-approved',
    handler: ReturnRequirementsController.requirementsApproved,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns requirements approved'
    }
  }, {
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
  }, {
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
  }, {
    method: 'GET',
    path: '/return-requirements/{sessionId}/no-return-check-your-answers',
    handler: ReturnRequirementsController.noReturnsCheckYourAnswers,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'No return check your answers page'
    }
  }, {
    method: 'POST',
    path: '/return-requirements/{sessionId}/no-return-check-your-answers',
    handler: ReturnRequirementsController.saveNoReturnsCheckYourAnswers,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'No return check your answers page'
    }
  }, {
    method: 'GET',
    path: '/return-requirements/{sessionId}/add-a-note',
    handler: ReturnRequirementsController.addANote,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns add a note page'
    }
  }, {
    method: 'POST',
    path: '/return-requirements/{sessionId}/add-a-note',
    handler: ReturnRequirementsController.saveNote,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Save note'
    }
  }, {
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
  }, {
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
  }, {
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
  }, {
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
  }, {
    method: 'GET',
    path: '/return-requirements/{sessionId}/points',
    handler: ReturnRequirementsController.selectPoints,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns select points page'
    }
  }, {
    method: 'GET',
    path: '/return-requirements/{sessionId}/returns-cycle',
    handler: ReturnRequirementsController.saveReturnsCycle,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Returns Select the returns cycle page'
    }
  }, {
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
  }, {
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
  }, {
    method: 'GET',
    path: '/return-requirements/{sessionId}/settings',
    handler: ReturnRequirementsController.returnsSettings,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Select how often collected readings or volumes are reported'
    }
  }, {
    method: 'GET',
    path: '/return-requirements/{sessionId}/purpose',
    handler: ReturnRequirementsController.selectPurpose,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Select purpose for returns requirement page'
    }
  }, {
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
  }
]

module.exports = routes
