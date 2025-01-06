'use strict'

const LicencesEndDatesController = require('../controllers/licences-end-dates.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/licences/end-dates/check',
    options: {
      handler: LicencesEndDatesController.check,
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
