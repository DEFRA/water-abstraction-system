'use strict'

const CheckController = require('../controllers/check.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/check/licence-return-logs',
    options: {
      handler: CheckController.returnLogsForLicence,
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  }, {
    method: 'POST',
    path: '/check/licence-ended-return-logs',
    options: {
      handler: CheckController.returnLogsForEndedLicence,
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  }
]

module.exports = routes
