const routes = [{
  method: 'GET',
  path: '/robots.txt',
  handler: {
    file: 'app/public/static/robots.txt'
  }
}, {
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
}]

export default routes
