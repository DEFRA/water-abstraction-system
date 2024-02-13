'use strict'

const LandingPageController = require('../controllers/landing-page.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/landing-page',
    handler: LandingPageController.view,
    options: {
      app: {
        excludeFromProd: true
      },
      auth: false,
      description: 'Used to view landing page'
    }
  }
]

module.exports = routes
