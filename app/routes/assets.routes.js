'use strict'

const routes = [
  {
    method: 'GET',
    path: '/assets/all.js',
    options: {
      handler: {
        file: 'node_modules/govuk-frontend/govuk/all.js'
      },
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/assets/{path*}',
    options: {
      handler: {
        directory: {
          path: ['app/public/static', 'app/public/build', 'node_modules/govuk-frontend/govuk/assets']
        }
      },
      app: {
        plainOutput: true
      },
      auth: false
    }
  }
]

module.exports = routes
