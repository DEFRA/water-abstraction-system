'use strict'

const ChargeElementsController = require('../controllers/charge-elements.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/charge-elements/time-limited',
    handler: ChargeElementsController.timeLimited,
    options: {
      description: 'Puts a licence into workflow when a charge element has a `timeLimitedEndDate` which is < 50 days away',
      app: {
        plainOutput: true
      }
    }
  }
]

module.exports = routes
