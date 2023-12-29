'use strict'

const ReturnRequirementsController = require('../controllers/return-requirements.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-requirements/{sessionId}/select-return-start-date',
    handler: ReturnRequirementsController.selectReturnStartDate,
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
    path: '/return-requirements/{sessionId}/select-return-start-date',
    handler: ReturnRequirementsController.saveReturnStartDate,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Select the start date of the return'
    }
  }, {
    method: 'GET',
    path: '/return-requirements/{sessionId}/reason',
    handler: ReturnRequirementsController.reasonNewRequirements,
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
    handler: ReturnRequirementsController.saveReasonNewRequirements,
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      description: 'Reason page'
    }
  }, {
    method: 'GET',
    path: '/return-requirements/{sessionId}/returns-how-do-you-want',
    handler: ReturnRequirementsController.returnsHowDoYouWant,
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
    path: '/return-requirements/{sessionId}/returns-how-do-you-want',
    handler: ReturnRequirementsController.saveReturnsHowDoYouWant,
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
    path: '/return-requirements/{sessionId}/returns-check-your-answers',
    handler: ReturnRequirementsController.returnsCheckYourAnswers,
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
    path: '/return-requirements/{sessionId}/returns-check-your-answers',
    handler: ReturnRequirementsController.saveReturnsCheckYourAnswers,
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
