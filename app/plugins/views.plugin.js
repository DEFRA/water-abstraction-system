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
const Vision = require('@hapi/vision')

const ServerConfig = require('../../config/server.config.js')

const ViewsPlugin = {
  plugin: Vision,
  options: {
    engines: {
      // The 'engine' is the file extension this applies to; in this case, .njk
      njk: {
        compile,
        prepare
      }
    },
    context,
    // the root file path used to resolve and load the templates identified when calling h.view()
    path: '../views',
    // a base path used as prefix for `path:`
    relativeTo: __dirname,
    // Only enable caching of templates if we are running in production
    isCached: ServerConfig.environment === 'production'
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
 *
 * @param {string} template The content of the template
 * @param {Object} options Vision's `config.compileOptions` property which we assign the Nunjucks Environment instance
 * to in `prepare()` below
 */
function compile (template, options) {
  const compiledTemplate = Nunjucks.compile(template, options.environment)

  return (context) => {
    return compiledTemplate.render(context)
  }
}

/**
 * Build global context used with _all_ templates
 *
 * According to the Vision docs the global context option can be either an object or a function that takes the `request`
 * as its only argument and returns a context object.
 *
 * When rendering views, the global context will be merged with any context object specified on the handler or using
 * `h.view()`. When multiple context objects are used, values from the global context always have lowest precedence.
 *
 * Expanding that last point what it means is when we call `h.view('bills/view.njk', { ...myContext })` in a controller
 * Vision will combine the 'context' (data) we pass in with the `params`, `payload`, `query` and `pre` values from the
 * `request` plus the output of this function and pass that through to the template. Nice!
 *
 * @param {Object} request Instance of a Hapi {@link https://hapi.dev/api/?v=21.3.2#request Request}
 *
 * @returns {Object} the global context for all templates
 */
function context (request) {
  return {
    // `assetPath` is referred to in layout.njk as the path to get static assets like client-side javascript
    assetPath: '/assets',
    auth: {
      authenticated: request.auth.isAuthenticated,
      authorized: request.auth.isAuthorized,
      user: request.auth.credentials?.user,
      scope: request.auth.credentials?.scope
    }
  }
}

/**
 * Initialises additional engine state
 *
 * That description and the ones for the params is taken directly from the
 * {@link https://hapi.dev/module/vision/api/?v=7.0.1#options Vision docs}.
 *
 * Essentially, Vision is 'engine agnostic'. It is intended to work with lots of view engines. Some of them, like
 * Nunjucks, require or can be configured. If `prepare:` is in the plugin options Vision will call it as part of
 * its initialisation so you can configure your chosen view engine.
 *
 * @param {*} config The engine configuration object allowing updates to be made. This is useful for engines like
 * Nunjucks that rely on additional state for rendering
 * @param {*} next Has the signature `function(err)`
 *
 * @returns the result of calling `next()`
 */
function prepare (config, next) {
  // Tell Nunjucks the paths to where your templates live. We _think_ Nunjucks searches in order of the paths provided.
  // So, search our templates first before searching in the govuk-frontend package for a template.
  const paths = [
    path.join(config.relativeTo, config.path),
    'node_modules/govuk-frontend/'
  ]

  // configure() returns an instance of Nunjucks Environment class (
  // see https://mozilla.github.io/nunjucks/api.html#environment) which is the central object for handling templates.
  // This gets assigned to Vision's compileOptions which is passed into `compile()` above as `options`.
  const environment = Nunjucks.configure(paths)

  config.compileOptions.environment = environment

  return next()
}

module.exports = ViewsPlugin
