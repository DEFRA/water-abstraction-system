/**
 * Our views plugin which serves views using nunjucks and govuk-frontend.
 *
 * The bulk of this is taken from https://github.com/DEFRA/hapi-web-boilerplate and tweaked to fit how we organise our
 * code. For now we have removed Google Analytics (which would have been added to the `context` option) as we can
 * integrate that at a later date.
 *
 * @module ViewsPlugin
 */

import path from 'path'
import nunjucks from 'nunjucks'
import Vision from '@hapi/vision'

import ServerConfig from '../../config/server.config.js'

const SERVICE_NAME = 'Manage your water abstraction or impoundment licence'

// thanks to https://stackoverflow.com/a/66651120/19939610
const __dirname = new URL('.', import.meta.url).pathname

const ViewsPlugin = {
  plugin: Vision,
  options: {
    engines: {
      // The 'engine' is the file extension this applies to; in this case, .njk
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)
          return context => template.render(context)
        },
        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure([
            path.join(options.relativeTo || process.cwd(), options.path),
            'node_modules/govuk-frontend/'
          ], {
            autoescape: true, // Automatically escape dangerous characters
            watch: false // We reload the template each time a page is accessed so don't need to watch files for changes
          })

          return next()
        }
      }
    },
    path: '../views',
    relativeTo: __dirname,
    isCached: ServerConfig.environment !== 'development', // Disable caching if we're running in dev

    // The context contains anything we want to pass through to our templates, eg. `assetPath` is referred to in
    // layout.njk as the path to get static assets like client-side javascript. These are added to or overridden in the
    // h.view() call in a controller.
    context: {
      appVersion: process.env.npm_package_version,
      assetPath: '/assets',
      serviceName: SERVICE_NAME,
      pageTitle: `${SERVICE_NAME} - GOV.UK`
    }
  }
}

export default ViewsPlugin
