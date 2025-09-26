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

const { markdown } = require('../views/filters/markdown.filter.js')

const ServerConfig = require('../../config/server.config.js')

const {
  enableSystemLicenceView,
  enableSystemManageView,
  enableSystemProfiles
} = require('../../config/feature-flags.config.js')

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
 * @param {string} template - The content of the template
 * @param {object} options - Vision's `config.compileOptions` property which we assign the Nunjucks Environment instance
 * to in `prepare()` below
 */
function compile(template, options) {
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
 * > Credit to https://www.solarwinter.net/hapi-vision-and-who-am-i/ for highlighting we could do this
 *
 * @param {object} request - Instance of a Hapi {@link https://hapi.dev/api/?v=21.3.2#request Request}
 *
 * @returns {object} the global context for all templates
 */
function context(request) {
  return {
    // `assetPath` is referred to in layout.njk as the path to get static assets like client-side javascript
    assetPath: '/assets',
    // this is the url of where the request came from. We use it to generate back links in our pages
    referrer: request.info.referrer,
    auth: {
      authenticated: request.auth.isAuthenticated,
      authorized: request.auth.isAuthorized,
      user: request.auth.credentials?.user,
      scope: request.auth.credentials?.scope,
      permission: request.auth.credentials?.permission
    },
    featureFlags: {
      enableSystemLicenceView,
      enableSystemManageView
    },
    navigationLinks: _navigationLinks(request.auth)
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
 * @param {*} config - The engine configuration object allowing updates to be made. This is useful for engines like
 * Nunjucks that rely on additional state for rendering
 * @param {*} next - Has the signature `function(err)`
 *
 * @returns the result of calling `next()`
 */
function prepare(config, next) {
  // Tell Nunjucks the paths to where your templates live. We _think_ Nunjucks searches in order of the paths provided.
  // So, search our templates first before searching in the govuk-frontend package for a template.
  const paths = [path.join(config.relativeTo, config.path), 'node_modules/govuk-frontend/']

  // configure() returns an instance of Nunjucks Environment class (
  // see https://mozilla.github.io/nunjucks/api.html#environment) which is the central object for handling templates.
  // This gets assigned to Vision's compileOptions which is passed into `compile()` above as `options`.
  const environment = Nunjucks.configure(paths)

  // Add custom filter to support rendering Notify notifications as HTML
  environment.addFilter('markdown', markdown)

  config.compileOptions.environment = environment

  return next()
}

/**
 * Determine which navigation links, if any to display in the top-level GOV.UK header
 *
 * When a user is authenticated we display a 'Change password' and 'Sign out' link in the top-level header of each page.
 *
 * Some users are also eligible to see a 'Contact information' link, which allows them to set their contact details
 * which will be used when generating, for example, renewal notifications.
 *
 * @param {object} auth - The `auth` property added to each Hapi request by the `AuthPlugin`. It tells us whether a user
 * is authenticated and what scopes (permissions) they have
 *
 * @returns {object[]} if the user is authenticated navigation links to display in the top-level GOV.UK header
 *
 * @private
 */
function _navigationLinks(auth) {
  if (!auth.isAuthenticated) {
    return []
  }

  const links = [
    { href: '/account/update-password', text: 'Change password' },
    { href: '/signout', text: 'Sign out' }
  ]

  const { scope } = auth.credentials

  if (scope.includes('hof_notifications') || scope.includes('renewal_notifications')) {
    if (enableSystemProfiles) {
      links.unshift({ href: '/system/users/me/profile-details', text: 'Profile details' })
    } else {
      links.unshift({ href: '/contact-information', text: 'Contact information' })
    }
  }

  return links
}

module.exports = ViewsPlugin
