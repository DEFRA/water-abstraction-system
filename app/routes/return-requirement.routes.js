'use strict'

const ReturnRequirementsController = require('../controllers/return-requirements.controller.js')

const routes = [
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
      description: 'Review two-part tariff match and allocation results'
    }
  }, {
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
    method: 'GET',
    path: '/return-requirements/{sessionId}/requirements-approved',
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
  }
]

module.exports = routes
