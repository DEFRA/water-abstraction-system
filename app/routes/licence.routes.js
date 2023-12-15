'use strict'

const LicencesController = require('../controllers/licences.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/licences/{id}/no-returns-required',
    handler: LicencesController.noReturnsRequired,
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
    path: '/licences/{id}/select-return-start-date',
    handler: LicencesController.selectReturnStartDate,
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
    path: '/licences/{id}/no-return-check-your-answers',
    handler: LicencesController.noReturnsCheckYourAnswers,
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
    path: '/licences/{id}/requirements-approved',
    handler: LicencesController.requirementsApproved,
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
    path: '/licences/{id}/returns-check-your-answers',
    handler: LicencesController.returnsCheckYourAnswers,
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
    path: '/licences/{id}/add-a-note',
    handler: LicencesController.addANote,
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
