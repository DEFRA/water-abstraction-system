'use strict'

const routes = [
  {
    method: 'GET',
    path: '/assets/all.js',
    handler: {
      file: 'node_modules/govuk-frontend/govuk/all.js'
    }
  }, {
    method: 'GET',
    path: '/assets/{path*}',
    handler: {
      directory: {
        path: [
          'app/public/static',
          'app/public/build',
          'node_modules/govuk-frontend/govuk/assets'
        ]
      }
    }
  }
]

module.exports = routes
