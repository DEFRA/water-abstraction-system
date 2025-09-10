'use strict'

const CallbackController = require('../controllers/callbacks.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/callback/returned-letter',
    options: {
      app: {
        plainOutput: true
      },
      auth: { strategy: 'callback' },
      handler: CallbackController.returnedLetter,
      plugins: {
        crumb: false
      }
    }
  }
]

module.exports = routes
