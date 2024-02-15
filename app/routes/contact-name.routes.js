'use strict'

const ContactNameController = require('../controllers/contact-name.controller')

const routes = [
  {
    method: 'GET',
    path: '/contact-name', // Do we want the pages to follow a dedicated route as a user journey.
    handler: ContactNameController.view,
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
