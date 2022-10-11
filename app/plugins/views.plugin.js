'use strict'

/**
 * Our views plugin which serves views using nunjucks and govuk-frontend.
 *
 * The bulk of this is taken from https://github.com/DEFRA/hapi-web-boilerplate and tweaked to fit how we organise our
 * code. For now we have removed Google Analytics (which would have been added to the `context` option) as we can
 * integrate that at a later date.
 *
 * @module ViewsPlugin
 */

const path = require('path')
const nunjucks = require('nunjucks')
const pkg = require('../../package.json')

// TODO: Document/understand the various options
const ViewsPlugin = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },
        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure([
            path.join(options.relativeTo || process.cwd(), options.path),
            'node_modules/govuk-frontend/'
          ], {
            autoescape: true,
            watch: false
          })

          return next()
        }
      }
    },
    path: '../views',
    relativeTo: __dirname,
    isCached: false, // TODO: Make this conditional so caching is `false` in dev and `true` everywhere else
    context: {
      appVersion: pkg.version,
      assetPath: '/assets',
      serviceName: 'Service name', // TODO: Update the service name
      pageTitle: 'Service name - GOV.UK' // TODO: Update the service name
    }
  }
}

module.exports = ViewsPlugin
