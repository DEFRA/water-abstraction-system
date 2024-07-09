'use strict'

const ImportController = require('./import.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/import/licence',
    handler: ImportController.LicenceTrigger,
    options: {
      app: {
        plainOutput: true
      },
      auth: false
    }
  }
]

module.exports = routes
