'use strict'

const ImportController = require('../controllers/import.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/import/licence',
    handler: ImportController.licence,
    options: {
      app: {
        plainOutput: true
      },
      auth: false
    }
  }
]

module.exports = routes
