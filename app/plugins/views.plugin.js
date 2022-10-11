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

const SERVICE_NAME = 'Manage your water abstraction or impoundment licence'

const path = require('path')
const nunjucks = require('nunjucks')
const pkg = require('../../package.json')

// TODO: Document/understand the various options
const ViewsPlugin = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      // The 'engine' is the file extension this applies to; in this case, .njk
      njk: {
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
      serviceName: SERVICE_NAME,
      pageTitle: `${SERVICE_NAME} - GOV.UK`
    }
  }
}

module.exports = ViewsPlugin
