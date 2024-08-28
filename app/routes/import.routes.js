'use strict'

const ImportController = require('../controllers/import.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/import/licence/legacy',
    handler: ImportController.licenceLegacy,
    options: {
      app: {
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
