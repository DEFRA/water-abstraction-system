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
const Nunjucks = require('nunjucks')

const pkg = require('../../package.json')

const ServerConfig = require('../../config/server.config.js')

const ViewsPlugin = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      // The 'engine' is the file extension this applies to; in this case, .njk
      njk: {
        compile,
        prepare: (options, next) => {
          options.compileOptions.environment = Nunjucks.configure([
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
      appVersion: pkg.version,
      assetPath: '/assets'
    }
  }
}

/**
 * The rendering function for the view engine
 *
 * When we register the Vision plugin we are required to populate `options:` (see
 * {@link https://hapi.dev/module/vision/api/?v=7.0.1#options options}). For each `engine:` we register (in our case
 * just Nunjucks) we must set the `compile:` property to a function which in turn returns a function that will be called
 * when a view is to be rendered, for example, when `h.view()` is called in a controller.
 *
 * We know, it's confusing! This is why we've broken it out here rather than follow the
 * {@link https://hapi.dev/module/vision/api/?v=7.0.1#nunjucks nunjucks example} which does it all inline.
 *
 * We believe it's done in this way to take advantage of a
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures closure}. Before rendering a template
 * Nunjucks needs to compile it. So, we can generate the compiled template using the args passed to this function.
 *
 * Using a closure, we can refer to the compiled template we create here in the function we're returning, even though
 * that function will be called somewhere else entirely!
 *
 * Tl;DR; It the object we pass to Vision `compile:` must be a function that returns a function :-)
 */
function compile (template, options) {
  const compiledTemplate = Nunjucks.compile(template, options.environment)

  return (context) => {
    return compiledTemplate.render(context)
  }
}

module.exports = ViewsPlugin
