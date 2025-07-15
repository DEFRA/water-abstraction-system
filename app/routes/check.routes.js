'use strict'

const CheckController = require('../controllers/check.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/check/generate-address',
    options: {
      handler: CheckController.generateAddress,
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
    path: '/check/placeholder',
    options: {
      handler: CheckController.placeholder,
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
    path: '/check/validate-address',
    options: {
      handler: CheckController.validateAddress,
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
