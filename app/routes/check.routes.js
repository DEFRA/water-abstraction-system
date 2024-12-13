'use strict'

const CheckController = require('../controllers/check.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/check/flag-for-billing',
    options: {
      handler: CheckController.flagForBilling,
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/check/licence-return-logs/{licenceId}',
    options: {
      handler: CheckController.licenceReturnLogs,
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
